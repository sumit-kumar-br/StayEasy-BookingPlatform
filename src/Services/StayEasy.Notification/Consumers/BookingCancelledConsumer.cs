using MassTransit;
using StayEasy.Notification.Abstractions;
using StayEasy.Shared.Contracts.Notifications;

namespace StayEasy.Notification.Consumers
{
    public class BookingCancelledConsumer : IConsumer<BookingCancelledEvent>
    {
        private readonly INotificationLogService _notificationService;

        public BookingCancelledConsumer(INotificationLogService notificationService)
        {
            _notificationService = notificationService;
        }

        public async Task Consume(ConsumeContext<BookingCancelledEvent> context)
        {
            var msg = context.Message;

            var subject = "Booking Cancelled";
            var body = $@"
                <h2>Your booking has been cancelled</h2>
                <p>Hotel: {msg.HotelName}</p>
                <p>Room: {msg.RoomTypeName}</p>
                <p>Check-in: {msg.CheckInUtc:yyyy-MM-dd}</p>
                <p>Check-out: {msg.CheckOutUtc:yyyy-MM-dd}</p>
                <p>Booking ID: {msg.BookingId}</p>
                <p>Cancelled by: {msg.CancelledBy}</p>";

            await _notificationService.HandleEmailAsync(
                msg.EventId,
                nameof(BookingCancelledEvent),
                msg.UserId,
                msg.Email,
                subject,
                body,
                context.CancellationToken);
        }
    }
}