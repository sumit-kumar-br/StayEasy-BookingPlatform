namespace StayEasy.Shared.Contracts.Notifications
{
    /// <summary>
    /// Defines UserRegisteredEvent.
    /// </summary>
    public class UserRegisteredEvent
    {
        public Guid EventId { get; set; } = Guid.NewGuid();
        public DateTime OccurredAtUtc { get; set; } = DateTime.UtcNow;
        public string CorrelationId { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}