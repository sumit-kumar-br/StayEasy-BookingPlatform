using StayEasy.Payment.DTOs;
using StayEasy.Shared.Common;

namespace StayEasy.Payment.Services
{
    /// <summary>
    /// Defines payment lifecycle operations for booking transactions.
    /// </summary>
    public interface IPaymentService
    {
        /// <summary>
        /// Creates a provider-side order/session for a booking payment.
        /// </summary>
        Task<ApiResponse<CreateOrderResponseDto>> CreateOrderAsync(CreateOrderRequestDto dto, Guid userId);

        /// <summary>
        /// Verifies provider callback data and marks payment outcome.
        /// </summary>
        Task<ApiResponse<bool>> VerifyPaymentAsync(VerifyPaymentRequestDto dto, Guid userId);

        /// <summary>
        /// Retrieves payment status for a booking and user context.
        /// </summary>
        Task<ApiResponse<PaymentStatusResponseDto>> GetPaymentStatusAsync(Guid bookingId, Guid userId);
    }
}
