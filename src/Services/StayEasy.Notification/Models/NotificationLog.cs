namespace StayEasy.Notification.Models
{
    /// <summary>
    /// Represents domain data for NotificationLog.
    /// </summary>
    public class NotificationLog
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid EventId { get; set; }
        public string EventType { get; set; } = string.Empty;
        public Guid UserId { get; set; }
        public string Email { get; set; } = string.Empty;
        public string Subject { get; set; } = string.Empty;
        public string Body { get; set; } = string.Empty;
        public NotificationChannel Channel { get; set; } = NotificationChannel.Email;
        public NotificationStatus Status { get; set; } = NotificationStatus.Pending;
        public int AttemptCount { get; set; }
        public string? ErrorMessage { get; set; }
        public DateTime CreatedAtUtc { get; set; } = DateTime.UtcNow;
        public DateTime? SentAtUtc { get; set; }
    }
}
