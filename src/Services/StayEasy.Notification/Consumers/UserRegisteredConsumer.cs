using MassTransit;
using StayEasy.Notification.Abstractions;
using StayEasy.Shared.Contracts.Notifications;

namespace StayEasy.Notification.Consumers
{
    public class UserRegisteredConsumer : IConsumer<UserRegisteredEvent>
    {
        private readonly INotificationLogService _notificationService;

        public UserRegisteredConsumer(INotificationLogService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Consume(ConsumeContext<UserRegisteredEvent> context)
        {
            var msg = context.Message;

            var subject = "Welcome to StayEasy";
            var body = $@"
                <h2>Hi {msg.FullName},</h2>
                <p>Welcome to StayEasy. Your account has been created successfully.</p>
                <p>Thanks,<br/>StayEasy Team</p>";

            await _notificationService.HandleEmailAsync(
                msg.EventId,
                nameof(UserRegisteredEvent),
                msg.UserId,
                msg.Email,
                subject,
                body,
                context.CancellationToken);
        }
    }
}