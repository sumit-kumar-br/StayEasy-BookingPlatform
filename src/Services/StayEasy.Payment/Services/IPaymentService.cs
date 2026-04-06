using StayEasy.Payment.DTOs;
using StayEasy.Shared.Common;

namespace StayEasy.Payment.Services
{
    public interface IPaymentService
    {
        Task<ApiResponse<CreateOrderResponseDto>> CreateOrderAsync(CreateOrderRequestDto dto, Guid userId);
        Task<ApiResponse<bool>> VerifyPaymentAsync(VerifyPaymentRequestDto dto, Guid userId);
        Task<ApiResponse<PaymentStatusResponseDto>> GetPaymentStatusAsync(Guid bookingId, Guid userId);
    }
}