using MassTransit;
using StayEasy.Notification.Abstractions;
using StayEasy.Shared.Contracts.Notifications;

namespace StayEasy.Notification.Consumers
{
    public class BookingCreatedConsumer : IConsumer<BookingCreatedEvent>
    {
        private readonly INotificationLogService _notificationService;

        public BookingCreatedConsumer(INotificationLogService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Consume(ConsumeContext<BookingCreatedEvent> context)
        {
            var msg = context.Message;

            var subject = "Booking Confirmed";
            var body = $@"
                <h2>Your booking is confirmed</h2>
                <p>Hotel: {msg.HotelName}</p>
                <p>Check-in: {msg.CheckInUtc:yyyy-MM-dd}</p>
                <p>Check-out: {msg.CheckOutUtc:yyyy-MM-dd}</p>
                <p>Booking ID: {msg.BookingId}</p>";

            await _notificationService.HandleEmailAsync(
                msg.EventId,
                nameof(BookingCreatedEvent),
                msg.UserId,
                msg.Email,
                subject,
                body,
                context.CancellationToken);
        }
    }
}