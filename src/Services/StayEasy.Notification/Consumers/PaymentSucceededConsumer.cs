using MassTransit;
using StayEasy.Notification.Abstractions;
using StayEasy.Shared.Contracts.Notifications;

namespace StayEasy.Notification.Consumers
{
    public class PaymentSucceededConsumer : IConsumer<PaymentSucceededEvent>
    {
        private readonly INotificationLogService _notificationService;

        public PaymentSucceededConsumer(INotificationLogService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Consume(ConsumeContext<PaymentSucceededEvent> context)
        {
            var msg = context.Message;

            var subject = "Payment Successful";
            var body = $@"
                <h2>Payment received</h2>
                <p>Booking ID: {msg.BookingId}</p>
                <p>Amount: {msg.Currency} {msg.Amount:0.00}</p>
                <p>Payment Reference: {msg.PaymentReference}</p>";

            await _notificationService.HandleEmailAsync(
                msg.EventId,
                nameof(PaymentSucceededEvent),
                msg.UserId,
                msg.Email,
                subject,
                body,
                context.CancellationToken);
        }
    }
}