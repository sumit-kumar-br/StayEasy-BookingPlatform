namespace StayEasy.Payment.DTOs
{
    /// <summary>
    /// Represents request and response contracts for CreateOrderResponseDto.
    /// </summary>
    public class CreateOrderResponseDto
    {
        public Guid TransactionId { get; set; }
        public Guid BookingId { get; set; }
        public string ProviderOrderId { get; set; } = string.Empty;
        public string KeyId { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
    }
}
