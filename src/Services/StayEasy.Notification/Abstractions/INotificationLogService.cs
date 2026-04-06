namespace StayEasy.Notification.Abstractions
{
    public interface INotificationLogService
    {
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