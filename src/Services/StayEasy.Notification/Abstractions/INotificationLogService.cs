namespace StayEasy.Notification.Abstractions
{
    /// <summary>
    /// Provides idempotent notification logging and dispatch helpers.
    /// </summary>
    public interface INotificationLogService
    {
        /// <summary>
        /// Records and sends an email notification for an event.
        /// </summary>
        Task HandleEmailAsync(
            Guid eventId,
            string eventType,
            Guid userId,
            string toEmail,
            string subject,
            string body,
            CancellationToken cancellationToken = default);
    }
}
