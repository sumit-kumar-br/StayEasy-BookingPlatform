namespace StayEasy.Payment.DTOs
{
    public class PaymentStatusResponseDto
    {
        public Guid BookingId { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? ProviderOrderId { get; set; }
        public string? ProviderPaymentId { get; set; }
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string? FailureReason { get; set; }
        public DateTime UpdatedAtUtc { get; set; }
    }
}