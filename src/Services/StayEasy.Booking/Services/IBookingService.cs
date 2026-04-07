using StayEasy.Booking.DTOs;
using StayEasy.Shared.Common;

namespace StayEasy.Booking.Services
{
    public interface IBookingService
    {
        Task<ApiResponse<HoldResponseDto>> CreateHoldAsync(CreateHoldDto dto, Guid travelerId);
        Task<ApiResponse<HoldResponseDto>> GetHoldAsync(Guid holdId);
        Task<ApiResponse<bool>> ReleaseHoldAsync(Guid holdId);
        Task<ApiResponse<BookingResponseDto>> ConfirmBookingAsync(CreateBookingDto dto, Guid travelerId);
        Task<ApiResponse<bool>> ConfirmBookingAsManagerAsync(Guid bookingId, Guid managerId);
        Task<ApiResponse<bool>> CancelBookingAsync(Guid bookingId, Guid travelerId);
        Task<ApiResponse<bool>> CancelBookingAsManagerAsync(Guid bookingId, Guid managerId);
        Task<ApiResponse<List<BookingResponseDto>>> GetMyBookingsAsync(Guid travelerId);
        Task<ApiResponse<BookingResponseDto>> GetBookingByIdAsync(Guid bookingId, Guid travelerId);
        Task<ApiResponse<List<BookingResponseDto>>> GetIncomingBookingsAsync();
    }
}
