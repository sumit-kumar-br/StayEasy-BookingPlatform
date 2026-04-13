using StayEasy.Booking.DTOs;
using StayEasy.Shared.Common;

namespace StayEasy.Booking.Services
{
    /// <summary>
    /// Defines booking lifecycle operations, including holds, confirmations, cancellations, and availability checks.
    /// </summary>
    public interface IBookingService
    {
        /// <summary>
        /// Creates a temporary hold for a room before payment/confirmation.
        /// </summary>
        Task<ApiResponse<HoldResponseDto>> CreateHoldAsync(CreateHoldDto dto, Guid travelerId);

        /// <summary>
        /// Retrieves hold details by hold identifier.
        /// </summary>
        Task<ApiResponse<HoldResponseDto>> GetHoldAsync(Guid holdId);

        /// <summary>
        /// Releases an existing hold manually.
        /// </summary>
        Task<ApiResponse<bool>> ReleaseHoldAsync(Guid holdId);

        /// <summary>
        /// Confirms a booking from a valid hold.
        /// </summary>
        Task<ApiResponse<BookingResponseDto>> ConfirmBookingAsync(CreateBookingDto dto, Guid travelerId);

        /// <summary>
        /// Confirms a booking from the hotel manager workflow.
        /// </summary>
        Task<ApiResponse<bool>> ConfirmBookingAsManagerAsync(Guid bookingId, Guid managerId);

        /// <summary>
        /// Cancels a booking as traveler, subject to business rules.
        /// </summary>
        Task<ApiResponse<bool>> CancelBookingAsync(Guid bookingId, Guid travelerId);

        /// <summary>
        /// Cancels a booking as manager, subject to ownership and date rules.
        /// </summary>
        Task<ApiResponse<bool>> CancelBookingAsManagerAsync(Guid bookingId, Guid managerId);

        /// <summary>
        /// Lists bookings that belong to a traveler.
        /// </summary>
        Task<ApiResponse<List<BookingResponseDto>>> GetMyBookingsAsync(Guid travelerId);

        /// <summary>
        /// Fetches a single booking that belongs to a traveler.
        /// </summary>
        Task<ApiResponse<BookingResponseDto>> GetBookingByIdAsync(Guid bookingId, Guid travelerId);

        /// <summary>
        /// Lists manager-facing incoming bookings.
        /// </summary>
        Task<ApiResponse<List<BookingResponseDto>>> GetIncomingBookingsAsync();

        /// <summary>
        /// Returns room availability for a date range.
        /// </summary>
        Task<ApiResponse<List<RoomAvailabilityDto>>> GetRoomAvailabilityAsync(Guid hotelId, DateTime checkIn, DateTime checkOut);
    }
}
