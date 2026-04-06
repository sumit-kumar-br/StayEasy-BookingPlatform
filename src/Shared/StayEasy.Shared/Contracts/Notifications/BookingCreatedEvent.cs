namespace StayEasy.Shared.Contracts.Notifications
{
    public class BookingCreatedEvent
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;
        public string CorrelationId { get; set; } = string.Empty;
        public Guid BookingId { get; set; }
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string HotelName { get; set; } = string.Empty;
        public DateTime CheckInUtc { get; set; }
        public DateTime CheckOutUtc { get; set; }
    }
}