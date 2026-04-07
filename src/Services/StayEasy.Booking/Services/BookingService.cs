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
        public async Task<ApiResponse<HoldResponseDto>> CreateHoldAsync(CreateHoldDto dto, Guid travelerId)
        {
            // Release any existing expired holds for this traveler + room
            var expiredHolds = await _db.HoldRecords.Where(h => h.TravelerId == travelerId &&
                                                     h.RoomTypeId == dto.RoomTypeId &&
                                                     !h.IsReleased && h.ExpiresAt < DateTime.UtcNow).ToListAsync();
            foreach (var expired in expiredHolds)
                expired.IsReleased = true;

            // Check if room is already held by someone else
            var activeHold = await _db.HoldRecords.AnyAsync(h=>h.RoomTypeId == dto.RoomTypeId &&
                                                            !h.IsReleased &&
                                                            h.ExpiresAt > DateTime.UtcNow &&
                                                            h.CheckIn < dto.CheckOut &&
                                                            h.CheckOut > dto.CheckIn);
            if (activeHold)
                return ApiResponse<HoldResponseDto>.Fail("This room is currently being booked by someone else. Please try again in a few minutes.");

            var hold = new HoldRecord
            {
                TravelerId = travelerId,
                HotelId = dto.HotelId,
                RoomTypeId = dto.RoomTypeId,
                HotelName = dto.HotelName,
                RoomTypeName = dto.RoomTypeName,
                CheckIn = dto.CheckIn,
                CheckOut = dto.CheckOut,
                Guests = dto.Guests,
                TotalAmount = dto.TotalAmount,
                ExpiresAt = DateTime.UtcNow.AddMinutes(10)
            };

            _db.HoldRecords.Add(hold);
            await _db.SaveChangesAsync();

            return ApiResponse<HoldResponseDto>.Ok(MapHoldToDto(hold));
        }
        public async Task<ApiResponse<HoldResponseDto>> GetHoldAsync(Guid holdId)
        {
            var hold = await _db.HoldRecords.FindAsync(holdId);

            if (hold == null || hold.IsReleased)
                throw new NotFoundException("Hold", holdId);

            if (hold.ExpiresAt < DateTime.UtcNow)
                return ApiResponse<HoldResponseDto>.Fail("Hold has expired. Please select your room again.");

            return ApiResponse<HoldResponseDto>.Ok(MapHoldToDto(hold));
        }
        public async Task<ApiResponse<bool>> ReleaseHoldAsync(Guid holdId)
        {
            var hold = await _db.HoldRecords.FindAsync(holdId);

            if (hold == null)
                throw new NotFoundException("Hold", holdId);

            hold.IsReleased = true;
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Hold released");
        }
        public async Task<ApiResponse<BookingResponseDto>> ConfirmBookingAsync(CreateBookingDto dto, Guid travelerId)
        {
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
                return ApiResponse<BookingResponseDto>.Fail("Hold has expired. Please select your room again.");

            if (hold.TravelerId != travelerId)
                throw new UnauthorizedException();

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

            return ApiResponse<BookingResponseDto>.Ok(MapBookingToDto(booking));
        }

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

            return ApiResponse<bool>.Ok(true, "Booking confirmed successfully.");
        }
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

            return ApiResponse<bool>.Ok(true, "Booking cancelled successfully.");
        }

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

            return ApiResponse<bool>.Ok(true, "Booking cancelled successfully.");
        }
        public async Task<ApiResponse<List<BookingResponseDto>>> GetMyBookingsAsync(Guid travelerId)
        {
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
        public async Task<ApiResponse<BookingResponseDto>> GetBookingByIdAsync(Guid bookingId, Guid travelerId)
        {
            var booking = await _db.Bookings.FirstOrDefaultAsync(b => b.Id == bookingId && b.TravelerId == travelerId);

            if (booking == null)
                throw new NotFoundException("Booking", bookingId);

            return ApiResponse<BookingResponseDto>.Ok(MapBookingToDto(booking));
        }

        public async Task<ApiResponse<List<BookingResponseDto>>> GetIncomingBookingsAsync()
        {
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
            var client = _httpClientFactory.CreateClient();
            var url = $"http://localhost:5062/api/hotels/{hotelId}";

            try
            {
                var response = await client.GetAsync(url);
                if (!response.IsSuccessStatusCode)
                    return false;

                var payload = await response.Content.ReadFromJsonAsync<ApiEnvelope<HotelOwnershipDto>>();
                return payload?.Data?.ManagerId == managerId;
            }
            catch
            {
                return false;
            }
        }

        private sealed class ApiEnvelope<T>
        {
            public T? Data { get; set; }
        }

        private sealed class HotelOwnershipDto
        {
            public Guid ManagerId { get; set; }
        }
    }
}
