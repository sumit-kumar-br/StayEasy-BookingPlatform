using Microsoft.EntityFrameworkCore;
using MassTransit;
using System.Net.Http.Json;
using StayEasy.Booking.DTOs;
using StayEasy.Booking.Data;
using StayEasy.Booking.Models;
using StayEasy.Shared.Common;
using StayEasy.Shared.Contracts.Notifications;
using StayEasy.Shared.Enums;
using StayEasy.Shared.Exceptions;
using BookingModel = StayEasy.Booking.Models.Booking;

namespace StayEasy.Booking.Services
{
    /// <summary>
    /// Implements hold, booking, cancellation, and availability workflows for reservations.
    /// </summary>
    public class BookingService: IBookingService
    {
        private readonly BookingDbContext _db;
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly IHttpClientFactory _httpClientFactory;
        public BookingService(BookingDbContext db, IPublishEndpoint publishEndpoint, IHttpClientFactory httpClientFactory)
        {
            _db = db;
            _publishEndpoint = publishEndpoint;
            _httpClientFactory = httpClientFactory;
        }

        /// <summary>
        /// Creates a short-lived hold after validating inventory for requested dates.
        /// </summary>
        public async Task<ApiResponse<HoldResponseDto>> CreateHoldAsync(CreateHoldDto dto, Guid travelerId)
        {
            await ReleaseExpiredHoldsAsync();

            var today = DateTime.Now.Date;

            if (dto.CheckIn.Date < today)
                return ApiResponse<HoldResponseDto>.Fail("Check-in date has already passed. Please select today or a future date.");

            if (dto.CheckOut <= dto.CheckIn)
                return ApiResponse<HoldResponseDto>.Fail("Check-out must be after check-in.");

            var requestedUnits = NormalizeRequestedUnits(dto.Guests);

            var totalUnits = await GetRoomTypeCapacityAsync(dto.HotelId, dto.RoomTypeId);
            if (!totalUnits.HasValue || totalUnits.Value <= 0)
                return ApiResponse<HoldResponseDto>.Fail("Unable to verify room inventory right now. Please try again.");

            var reservedUnits = await GetReservedUnitsAsync(dto.RoomTypeId, dto.CheckIn, dto.CheckOut);
            var availableUnits = Math.Max(0, totalUnits.Value - reservedUnits);

            if (requestedUnits > availableUnits)
                return ApiResponse<HoldResponseDto>.Fail($"Only {availableUnits} room(s) are available for the selected dates.");

            var hold = new HoldRecord
            {
                TravelerId = travelerId,
                HotelId = dto.HotelId,
                RoomTypeId = dto.RoomTypeId,
                HotelName = dto.HotelName,
                RoomTypeName = dto.RoomTypeName,
                CheckIn = dto.CheckIn,
                CheckOut = dto.CheckOut,
                Guests = requestedUnits,
                TotalAmount = dto.TotalAmount,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10)
            };

            _db.HoldRecords.Add(hold);
            await _db.SaveChangesAsync();

            return ApiResponse<HoldResponseDto>.Ok(MapHoldToDto(hold));
        }

        /// <summary>
        /// Retrieves an active hold and returns expiry-aware details.
        /// </summary>
        public async Task<ApiResponse<HoldResponseDto>> GetHoldAsync(Guid holdId)
        {
            await ReleaseExpiredHoldsAsync();

            var hold = await _db.HoldRecords.FindAsync(holdId);

            if (hold == null || hold.IsReleased)
                throw new NotFoundException("Hold", holdId);

            if (hold.ExpiresAt < DateTime.UtcNow)
            {
                hold.IsReleased = true;
                await _db.SaveChangesAsync();
                return ApiResponse<HoldResponseDto>.Fail("Hold has expired. Please select your room again.");
            }

            return ApiResponse<HoldResponseDto>.Ok(MapHoldToDto(hold));
        }

        /// <summary>
        /// Releases an existing hold record.
        /// </summary>
        public async Task<ApiResponse<bool>> ReleaseHoldAsync(Guid holdId)
        {
            var hold = await _db.HoldRecords.FindAsync(holdId);

            if (hold == null)
                throw new NotFoundException("Hold", holdId);

            hold.IsReleased = true;
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Hold released");
        }

        /// <summary>
        /// Confirms a booking from a valid hold and publishes booking events.
        /// </summary>
        public async Task<ApiResponse<BookingResponseDto>> ConfirmBookingAsync(CreateBookingDto dto, Guid travelerId)
        {
            await ReleaseExpiredHoldsAsync();

            var today = DateTime.Now.Date;

            var hold = await _db.HoldRecords.FindAsync(dto.HoldId);

            if (hold == null)
                return ApiResponse<BookingResponseDto>.Fail("Hold not found or already released.");

            if (hold.IsReleased)
            {
                // Idempotent retry: if booking was already created from this hold details, return it.
                var existingBooking = await _db.Bookings
                    .Where(b => b.TravelerId == travelerId &&
                                b.HotelId == hold.HotelId &&
                                b.RoomTypeId == hold.RoomTypeId &&
                                b.CheckIn == hold.CheckIn &&
                                b.CheckOut == hold.CheckOut)
                    .OrderByDescending(b => b.CreatedAt)
                    .FirstOrDefaultAsync();

                if (existingBooking != null)
                    return ApiResponse<BookingResponseDto>.Ok(MapBookingToDto(existingBooking));

                return ApiResponse<BookingResponseDto>.Fail("Hold not found or already released.");
            }

            if (hold.ExpiresAt < DateTime.UtcNow)
            {
                hold.IsReleased = true;
                await _db.SaveChangesAsync();
                return ApiResponse<BookingResponseDto>.Fail("Hold has expired. Please select your room again.");
            }

            if (hold.CheckIn.Date < today)
            {
                hold.IsReleased = true;
                await _db.SaveChangesAsync();
                return ApiResponse<BookingResponseDto>.Fail("Check-in date has already passed. Please select today or a future date.");
            }

            if (hold.TravelerId != travelerId)
                throw new UnauthorizedException();

            var totalUnits = await GetRoomTypeCapacityAsync(hold.HotelId, hold.RoomTypeId);
            if (!totalUnits.HasValue || totalUnits.Value <= 0)
                return ApiResponse<BookingResponseDto>.Fail("Unable to verify room inventory right now. Please try again.");

            var reservedExcludingThisHold = await GetReservedUnitsAsync(hold.RoomTypeId, hold.CheckIn, hold.CheckOut, hold.Id);
            var holdUnits = NormalizeRequestedUnits(hold.Guests);

            if (holdUnits + reservedExcludingThisHold > totalUnits.Value)
                return ApiResponse<BookingResponseDto>.Fail("Selected room inventory changed. Please try again.");

            // Generate booking reference
            var bookingRef = $"STY-{DateTime.UtcNow.Year}-{Guid.NewGuid().ToString("N")[..6].ToUpper()}";

            var booking = new Booking.Models.Booking
            {
                BookingRef = bookingRef,
                TravelerId = travelerId,
                HotelId = hold.HotelId,
                RoomTypeId = hold.RoomTypeId,
                HotelName = hold.HotelName,
                RoomTypeName = hold.RoomTypeName,
                GuestName = dto.GuestName,
                GuestEmail = dto.GuestEmail,
                CheckIn = hold.CheckIn,
                CheckOut = hold.CheckOut,
                Guests = hold.Guests,
                TotalAmount = hold.TotalAmount,
                SpecialRequests = dto.SpecialRequests,
                Status = BookingStatus.Confirmed
            };

            _db.Bookings.Add(booking);

            // Release the hold
            hold.IsReleased = true;
            await _db.SaveChangesAsync();

            try
            {
                await _publishEndpoint.Publish(new BookingCreatedEvent
                {
                    EventId = Guid.NewGuid(),
                    OccurredAtUtc = DateTime.UtcNow,
                    CorrelationId = booking.BookingRef,
                    BookingId = booking.Id,
                    UserId = travelerId,
                    Email = booking.GuestEmail,
                    HotelName = booking.HotelName,
                    CheckInUtc = booking.CheckIn,
                    CheckOutUtc = booking.CheckOut
                });
            }
            catch
            {
                // Do not fail booking confirmation if notification infrastructure is temporarily unavailable.
            }

            var managerContact = await TryGetManagerContactByHotelAsync(booking.HotelId);
            if (managerContact is not null)
            {
                try
                {
                    await _publishEndpoint.Publish(new ManagerBookingRequestEvent
                    {
                        EventId = Guid.NewGuid(),
                        OccurredAtUtc = DateTime.UtcNow,
                        CorrelationId = booking.BookingRef,
                        BookingId = booking.Id,
                        HotelId = booking.HotelId,
                        ManagerId = managerContact.Id,
                        Email = managerContact.Email,
                        HotelName = booking.HotelName,
                        RoomTypeName = booking.RoomTypeName,
                        GuestName = booking.GuestName,
                        CheckInUtc = booking.CheckIn,
                        CheckOutUtc = booking.CheckOut
                    });
                }
                catch
                {
                    // Do not fail booking confirmation if notification infrastructure is temporarily unavailable.
                }
            }

            return ApiResponse<BookingResponseDto>.Ok(MapBookingToDto(booking));
        }

        /// <summary>
        /// Confirms a booking through the manager workflow for owned properties.
        /// </summary>
        public async Task<ApiResponse<bool>> ConfirmBookingAsManagerAsync(Guid bookingId, Guid managerId)
        {
            var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
                throw new NotFoundException("Booking", bookingId);

            var isManagedByRequester = await IsHotelOwnedByManagerAsync(booking.HotelId, managerId);
            if (!isManagedByRequester)
                return ApiResponse<bool>.Fail("You can confirm bookings only for your hotels.");

            if (booking.Status == BookingStatus.Confirmed)
                return ApiResponse<bool>.Fail("Booking is already confirmed.");

            if (booking.Status == BookingStatus.Cancelled ||
                booking.Status == BookingStatus.CheckedIn ||
                booking.Status == BookingStatus.CheckedOut ||
                booking.Status == BookingStatus.NoShow)
                return ApiResponse<bool>.Fail("This booking can no longer be confirmed.");

            booking.Status = BookingStatus.Confirmed;
            await _db.SaveChangesAsync();

            try
            {
                await _publishEndpoint.Publish(new BookingCreatedEvent
                {
                    EventId = Guid.NewGuid(),
                    OccurredAtUtc = DateTime.UtcNow,
                    CorrelationId = booking.BookingRef,
                    BookingId = booking.Id,
                    UserId = booking.TravelerId,
                    Email = booking.GuestEmail,
                    HotelName = booking.HotelName,
                    CheckInUtc = booking.CheckIn,
                    CheckOutUtc = booking.CheckOut
                });
            }
            catch
            {
                // Do not fail booking confirmation if notification infrastructure is temporarily unavailable.
            }

            var managerContact = await TryGetUserContactAsync(managerId);
            if (managerContact is not null)
            {
                try
                {
                    await _publishEndpoint.Publish(new ManagerBookingConfirmedEvent
                    {
                        EventId = Guid.NewGuid(),
                        OccurredAtUtc = DateTime.UtcNow,
                        CorrelationId = booking.BookingRef,
                        BookingId = booking.Id,
                        HotelId = booking.HotelId,
                        ManagerId = managerContact.Id,
                        Email = managerContact.Email,
                        HotelName = booking.HotelName,
                        RoomTypeName = booking.RoomTypeName,
                        GuestName = booking.GuestName,
                        CheckInUtc = booking.CheckIn,
                        CheckOutUtc = booking.CheckOut
                    });
                }
                catch
                {
                    // Do not fail booking confirmation if notification infrastructure is temporarily unavailable.
                }
            }

            return ApiResponse<bool>.Ok(true, "Booking confirmed successfully.");
        }

        /// <summary>
        /// Cancels a traveler booking when cancellation policies allow it.
        /// </summary>
        public async Task<ApiResponse<bool>> CancelBookingAsync(Guid bookingId, Guid travelerId)
        {
            var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId 
                                                        && b.TravelerId == travelerId);

            if (booking == null)
                throw new NotFoundException("Booking", bookingId);

            if (booking.Status == BookingStatus.Cancelled)
                return ApiResponse<bool>.Fail("Booking is already cancelled.");

            if (booking.Status == BookingStatus.CheckedIn ||
                booking.Status == BookingStatus.CheckedOut ||
                booking.Status == BookingStatus.NoShow)
                return ApiResponse<bool>.Fail("This booking can no longer be cancelled.");

            if (DateTime.UtcNow.Date >= booking.CheckIn.Date)
                return ApiResponse<bool>.Fail("Booking cannot be cancelled on or after check-in date.");

            _db.Bookings.Remove(booking);
            await _db.SaveChangesAsync();

            try
            {
                await _publishEndpoint.Publish(new BookingCancelledEvent
                {
                    EventId = Guid.NewGuid(),
                    OccurredAtUtc = DateTime.UtcNow,
                    CorrelationId = booking.BookingRef,
                    BookingId = booking.Id,
                    UserId = travelerId,
                    Email = booking.GuestEmail,
                    HotelName = booking.HotelName,
                    RoomTypeName = booking.RoomTypeName,
                    CheckInUtc = booking.CheckIn,
                    CheckOutUtc = booking.CheckOut,
                    CancelledBy = "Traveler"
                });
            }
            catch
            {
            }

            var managerContact = await TryGetManagerContactByHotelAsync(booking.HotelId);
            if (managerContact is not null)
            {
                try
                {
                    await _publishEndpoint.Publish(new ManagerBookingCancelledEvent
                    {
                        EventId = Guid.NewGuid(),
                        OccurredAtUtc = DateTime.UtcNow,
                        CorrelationId = booking.BookingRef,
                        BookingId = booking.Id,
                        HotelId = booking.HotelId,
                        ManagerId = managerContact.Id,
                        Email = managerContact.Email,
                        HotelName = booking.HotelName,
                        RoomTypeName = booking.RoomTypeName,
                        GuestName = booking.GuestName,
                        CheckInUtc = booking.CheckIn,
                        CheckOutUtc = booking.CheckOut,
                        CancelledBy = "Traveler"
                    });
                }
                catch
                {
                }
            }

            return ApiResponse<bool>.Ok(true, "Booking cancelled successfully.");
        }

        /// <summary>
        /// Cancels a booking as manager for hotels the manager owns.
        /// </summary>
        public async Task<ApiResponse<bool>> CancelBookingAsManagerAsync(Guid bookingId, Guid managerId)
        {
            var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId);

            if (booking == null)
                throw new NotFoundException("Booking", bookingId);

            var isManagedByRequester = await IsHotelOwnedByManagerAsync(booking.HotelId, managerId);
            if (!isManagedByRequester)
                return ApiResponse<bool>.Fail("You can cancel bookings only for your hotels.");

            if (booking.Status == BookingStatus.Cancelled)
                return ApiResponse<bool>.Fail("Booking is already cancelled.");

            if (booking.Status == BookingStatus.CheckedIn ||
                booking.Status == BookingStatus.CheckedOut ||
                booking.Status == BookingStatus.NoShow)
                return ApiResponse<bool>.Fail("This booking can no longer be cancelled.");

            _db.Bookings.Remove(booking);
            await _db.SaveChangesAsync();

            try
            {
                await _publishEndpoint.Publish(new BookingCancelledEvent
                {
                    EventId = Guid.NewGuid(),
                    OccurredAtUtc = DateTime.UtcNow,
                    CorrelationId = booking.BookingRef,
                    BookingId = booking.Id,
                    UserId = booking.TravelerId,
                    Email = booking.GuestEmail,
                    HotelName = booking.HotelName,
                    RoomTypeName = booking.RoomTypeName,
                    CheckInUtc = booking.CheckIn,
                    CheckOutUtc = booking.CheckOut,
                    CancelledBy = "Hotel Manager"
                });
            }
            catch
            {
            }

            var managerContact = await TryGetUserContactAsync(managerId);
            if (managerContact is not null)
            {
                try
                {
                    await _publishEndpoint.Publish(new ManagerBookingCancelledEvent
                    {
                        EventId = Guid.NewGuid(),
                        OccurredAtUtc = DateTime.UtcNow,
                        CorrelationId = booking.BookingRef,
                        BookingId = booking.Id,
                        HotelId = booking.HotelId,
                        ManagerId = managerContact.Id,
                        Email = managerContact.Email,
                        HotelName = booking.HotelName,
                        RoomTypeName = booking.RoomTypeName,
                        GuestName = booking.GuestName,
                        CheckInUtc = booking.CheckIn,
                        CheckOutUtc = booking.CheckOut,
                        CancelledBy = "Hotel Manager"
                    });
                }
                catch
                {
                }
            }

            return ApiResponse<bool>.Ok(true, "Booking cancelled successfully.");
        }

        /// <summary>
        /// Lists bookings belonging to a traveler.
        /// </summary>
        public async Task<ApiResponse<List<BookingResponseDto>>> GetMyBookingsAsync(Guid travelerId)
        {
            await ReleaseExpiredHoldsAsync();

            var cancelledBookings = await _db.Bookings
                .Where(b => b.TravelerId == travelerId && b.Status == BookingStatus.Cancelled)
                .ToListAsync();

            if (cancelledBookings.Count > 0)
            {
                _db.Bookings.RemoveRange(cancelledBookings);
                await _db.SaveChangesAsync();
            }

            var bookings = await _db.Bookings.Where(b => b.TravelerId == travelerId)
                                            .OrderByDescending(b => b.CreatedAt)
                                            .ToListAsync();

            return ApiResponse<List<BookingResponseDto>>.Ok(bookings.Select(MapBookingToDto).ToList());
        }

        /// <summary>
        /// Returns one booking for a traveler-owned booking id.
        /// </summary>
        public async Task<ApiResponse<BookingResponseDto>> GetBookingByIdAsync(Guid bookingId, Guid travelerId)
        {
            var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId && b.TravelerId == travelerId);

            if (booking == null)
                throw new NotFoundException("Booking", bookingId);

            return ApiResponse<BookingResponseDto>.Ok(MapBookingToDto(booking));
        }

        /// <summary>
        /// Returns manager-facing incoming bookings.
        /// </summary>
        public async Task<ApiResponse<List<BookingResponseDto>>> GetIncomingBookingsAsync()
        {
            await ReleaseExpiredHoldsAsync();

            var cancelledBookings = await _db.Bookings
                .Where(b => b.Status == BookingStatus.Cancelled)
                .ToListAsync();

            if (cancelledBookings.Count > 0)
            {
                _db.Bookings.RemoveRange(cancelledBookings);
                await _db.SaveChangesAsync();
            }

            var bookings = await _db.Bookings
                .Where(b => b.Status == BookingStatus.Pending || b.Status == BookingStatus.Confirmed)
                .OrderByDescending(b => b.CreatedAt)
                .ToListAsync();

            return ApiResponse<List<BookingResponseDto>>.Ok(bookings.Select(MapBookingToDto).ToList());
        }

        /// <summary>
        /// Computes room availability for the selected hotel and date range.
        /// </summary>
        public async Task<ApiResponse<List<RoomAvailabilityDto>>> GetRoomAvailabilityAsync(Guid hotelId, DateTime checkIn, DateTime checkOut)
        {
            await ReleaseExpiredHoldsAsync();

            var today = DateTime.Now.Date;

            if (checkIn.Date < today)
                return ApiResponse<List<RoomAvailabilityDto>>.Fail("Check-in date has already passed. Please select today or a future date.");

            if (checkOut <= checkIn)
                return ApiResponse<List<RoomAvailabilityDto>>.Fail("Check-out must be after check-in.");

            var roomTypes = await GetRoomTypesForHotelAsync(hotelId);

            if (roomTypes == null)
                return ApiResponse<List<RoomAvailabilityDto>>.Ok(new List<RoomAvailabilityDto>(), "Room availability is temporarily unavailable.");

            var result = new List<RoomAvailabilityDto>(roomTypes.Count);

            foreach (var room in roomTypes.Where(r => r.IsActive && r.TotalRooms > 0))
            {
                var reserved = await GetReservedUnitsAsync(room.Id, checkIn, checkOut);
                result.Add(new RoomAvailabilityDto
                {
                    RoomTypeId = room.Id,
                    TotalUnits = room.TotalRooms,
                    ReservedUnits = reserved,
                    AvailableUnits = Math.Max(0, room.TotalRooms - reserved)
                });
            }

            return ApiResponse<List<RoomAvailabilityDto>>.Ok(result);
        }

        private static HoldResponseDto MapHoldToDto(HoldRecord hold) => new()
        {
            HoldId = hold.Id,
            HotelId = hold.HotelId,
            RoomTypeId = hold.RoomTypeId,
            HotelName = hold.HotelName,
            RoomTypeName = hold.RoomTypeName,
            CheckIn = hold.CheckIn,
            CheckOut = hold.CheckOut,
            Guests = hold.Guests,
            TotalAmount = hold.TotalAmount,
            ExpiresAt = hold.ExpiresAt,
            MinutesRemaining = (int)(hold.ExpiresAt - DateTime.UtcNow).TotalMinutes
        };

        private static BookingResponseDto MapBookingToDto(BookingModel booking) => new()
        {
            Id = booking.Id,
            BookingRef = booking.BookingRef,
            HotelId = booking.HotelId,
            RoomTypeId = booking.RoomTypeId,
            HotelName = booking.HotelName,
            RoomTypeName = booking.RoomTypeName,
            GuestName = booking.GuestName,
            GuestEmail = booking.GuestEmail,
            CheckIn = booking.CheckIn,
            CheckOut = booking.CheckOut,
            Guests = booking.Guests,
            TotalAmount = booking.TotalAmount,
            Status = booking.Status.ToString(),
            SpecialRequests = booking.SpecialRequests,
            CreatedAt = booking.CreatedAt
        };

        private async Task<bool> IsHotelOwnedByManagerAsync(Guid hotelId, Guid managerId)
        {
            var hotelManagerId = await GetHotelManagerIdAsync(hotelId);
            return hotelManagerId.HasValue && hotelManagerId.Value == managerId;
        }

        private async Task<ManagerContactDto?> TryGetManagerContactByHotelAsync(Guid hotelId)
        {
            var managerId = await GetHotelManagerIdAsync(hotelId);
            if (!managerId.HasValue)
                return null;

            return await TryGetUserContactAsync(managerId.Value);
        }

        private async Task<ManagerContactDto?> TryGetUserContactAsync(Guid userId)
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"http://localhost:7159/api/auth/internal/users/{userId}";

            try
            {
                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return null;

                var payload = await response.Content.ReadFromJsonAsync<ApiResponse<ManagerContactDto>>();
                if (payload?.Data is null || string.IsNullOrWhiteSpace(payload.Data.Email))
                    return null;

                return payload.Data;
            }
            catch
            {
                return null;
            }
        }

        private async Task<Guid?> GetHotelManagerIdAsync(Guid hotelId)
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"http://localhost:5062/api/hotels/{hotelId}";

            try
            {
                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return null;

                var payload = await response.Content.ReadFromJsonAsync<ApiEnvelope<HotelOwnershipDto>>();
                return payload?.Data?.ManagerId;
            }
            catch
            {
                return null;
            }
        }

        private sealed class ApiEnvelope<T>
        {
            public T? Data { get; set; }
        }

        private static int NormalizeRequestedUnits(int value) => value > 0 ? value : 1;

        private async Task ReleaseExpiredHoldsAsync()
        {
            var now = DateTime.UtcNow;

            var expiredHolds = await _db.HoldRecords
                .Where(h => !h.IsReleased && h.ExpiresAt <= now)
                .ToListAsync();

            if (expiredHolds.Count == 0)
                return;

            foreach (var hold in expiredHolds)
                hold.IsReleased = true;

            await _db.SaveChangesAsync();
        }

        private async Task<int?> GetRoomTypeCapacityAsync(Guid hotelId, Guid roomTypeId)
        {
            var roomTypes = await GetRoomTypesForHotelAsync(hotelId);
            var roomType = roomTypes?.FirstOrDefault(r => r.Id == roomTypeId && r.IsActive);
            return roomType?.TotalRooms;
        }

        private async Task<List<RoomTypeCapacityDto>?> GetRoomTypesForHotelAsync(Guid hotelId)
        {
            var client = _httpClientFactory.CreateClient();
            var url = $"http://localhost:5062/api/rooms?hotelId={hotelId}";

            try
            {
                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return null;

                var payload = await response.Content.ReadFromJsonAsync<ApiResponse<List<RoomTypeCapacityDto>>>();
                return payload?.Data;
            }
            catch
            {
                return null;
            }
        }

        private async Task<int> GetReservedUnitsAsync(Guid roomTypeId, DateTime checkIn, DateTime checkOut, Guid? excludeHoldId = null)
        {
            var requestedCheckInDate = checkIn.Date;
            var requestedCheckOutDate = checkOut.Date;
            var now = DateTime.UtcNow;

            var activeHoldQuery = _db.HoldRecords.Where(h =>
                h.RoomTypeId == roomTypeId &&
                !h.IsReleased &&
                h.ExpiresAt > now &&
                h.CheckIn.Date < requestedCheckOutDate &&
                h.CheckOut.Date > requestedCheckInDate);

            if (excludeHoldId.HasValue)
                activeHoldQuery = activeHoldQuery.Where(h => h.Id != excludeHoldId.Value);

            var heldUnits = await activeHoldQuery.SumAsync(h => h.Guests > 0 ? h.Guests : 1);

            var bookedUnits = await _db.Bookings
                .Where(b =>
                    b.RoomTypeId == roomTypeId &&
                    b.Status != BookingStatus.Cancelled &&
                    b.Status != BookingStatus.CheckedOut &&
                    b.Status != BookingStatus.NoShow &&
                    b.CheckIn.Date < requestedCheckOutDate &&
                    b.CheckOut.Date > requestedCheckInDate)
                .SumAsync(b => b.Guests > 0 ? b.Guests : 1);

            return heldUnits + bookedUnits;
        }

        private sealed class RoomTypeCapacityDto
        {
            public Guid Id { get; set; }
            public int TotalRooms { get; set; }
            public bool IsActive { get; set; }
        }

        private sealed class HotelOwnershipDto
        {
            public Guid ManagerId { get; set; }
        }

        private sealed class ManagerContactDto
        {
            public Guid Id { get; set; }
            public string FullName { get; set; } = string.Empty;
            public string Email { get; set; } = string.Empty;
            public string Role { get; set; } = string.Empty;
        }
    }
}
