namespace StayEasy.Shared.Contracts.Notifications
{
    public class PaymentSucceededEvent
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;
        public string CorrelationId { get; set; } = string.Empty;
        public Guid BookingId { get; set; }
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public decimal Amount { get; set; }
        public string Currency { get; set; } = "INR";
        public string PaymentReference { get; set; } = string.Empty;
    }
}