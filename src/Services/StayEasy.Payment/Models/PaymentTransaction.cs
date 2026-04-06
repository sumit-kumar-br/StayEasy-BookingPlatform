namespace StayEasy.Payment.Models
{
    public class PaymentTransaction
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid BookingId { get; set; }
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string Provider { get; set; } = "Razorpay";
        public string ProviderOrderId { get; set; } = string.Empty;
        public string? ProviderPaymentId { get; set; }
        public string? RazorpaySignature { get; set; }
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending;
        public string? FailureReason { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAtUtc { get; set; } = DateTime.UtcNow;
    }
}