using MassTransit;
using System.Net;
using StayEasy.Notification.Abstractions;
using StayEasy.Shared.Contracts.Notifications;

namespace StayEasy.Notification.Consumers
{
    /// <summary>
    /// Consumes integration events in ManagerBookingRequestConsumer.
    /// </summary>
    public class ManagerBookingRequestConsumer : IConsumer<ManagerBookingRequestEvent>
    {
        private readonly INotificationLogService _notificationService;

        public ManagerBookingRequestConsumer(INotificationLogService notificationService)
        {
            _notificationService = notificationService;
        }

        /// <summary>
        /// Executes Consume business operation.
        /// </summary>
        public async Task Consume(ConsumeContext<ManagerBookingRequestEvent> context)
        {
            var msg = context.Message;

            var subject = "New Booking Request";
            var body = BuildManagerBookingRequestEmail(msg);

            await _notificationService.HandleEmailAsync(
                msg.EventId,
                nameof(ManagerBookingRequestEvent),
                msg.ManagerId,
                msg.Email,
                subject,
                body,
                context.CancellationToken);
        }

        private static string BuildManagerBookingRequestEmail(ManagerBookingRequestEvent msg)
        {
            var hotelName = WebUtility.HtmlEncode(msg.HotelName);
            var roomType = WebUtility.HtmlEncode(msg.RoomTypeName);
            var guestName = WebUtility.HtmlEncode(msg.GuestName);
            var bookingId = WebUtility.HtmlEncode(msg.BookingId.ToString());
            var checkIn = msg.CheckInUtc.ToString("ddd, dd MMM yyyy");
            var checkOut = msg.CheckOutUtc.ToString("ddd, dd MMM yyyy");

            return $@"
<!doctype html>
<html lang='en'>
  <body style='margin:0;padding:0;background-color:#f4f7fb;font-family:Segoe UI,Arial,sans-serif;color:#12263a;'>
    <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='background-color:#f4f7fb;padding:24px 12px;'>
      <tr>
        <td align='center'>
          <table role='presentation' width='640' cellspacing='0' cellpadding='0' style='width:100%;max-width:640px;background:#ffffff;border:1px solid #dce5f0;border-radius:14px;overflow:hidden;'>
            <tr>
              <td style='padding:22px 24px;background:linear-gradient(120deg,#0f766e 0%,#115e59 100%);color:#ffffff;'>
                <div style='font-size:14px;letter-spacing:0.8px;text-transform:uppercase;opacity:0.9;'>StayEasy</div>
                <h1 style='margin:10px 0 4px;font-size:26px;line-height:1.2;'>New booking request</h1>
                <p style='margin:0;font-size:15px;opacity:0.95;'>A traveler created a booking that requires your attention.</p>
              </td>
            </tr>
            <tr>
              <td style='padding:24px;'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border:1px solid #e7edf5;border-radius:10px;background:#f8fbff;'>
                  <tr>
                    <td style='padding:18px 18px 8px;'>
                      <p style='margin:0 0 6px;font-size:13px;color:#5b7189;text-transform:uppercase;letter-spacing:0.6px;'>Hotel</p>
                      <p style='margin:0;font-size:21px;font-weight:700;color:#0f2742;'>{hotelName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding:0 18px 8px;'>
                      <p style='margin:0;font-size:15px;color:#334e68;'><strong>Room Type:</strong> {roomType}</p>
                      <p style='margin:8px 0 0;font-size:15px;color:#334e68;'><strong>Guest:</strong> {guestName}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding:0 18px 18px;'>
                      <table role='presentation' width='100%' cellspacing='0' cellpadding='0'>
                        <tr>
                          <td style='padding:12px 10px;border:1px solid #dce7f5;border-radius:8px;background:#ffffff;'>
                            <p style='margin:0 0 5px;font-size:12px;color:#607588;text-transform:uppercase;letter-spacing:0.5px;'>Check-in</p>
                            <p style='margin:0;font-size:16px;font-weight:600;color:#10253d;'>{checkIn}</p>
                          </td>
                          <td style='width:10px;'></td>
                          <td style='padding:12px 10px;border:1px solid #dce7f5;border-radius:8px;background:#ffffff;'>
                            <p style='margin:0 0 5px;font-size:12px;color:#607588;text-transform:uppercase;letter-spacing:0.5px;'>Check-out</p>
                            <p style='margin:0;font-size:16px;font-weight:600;color:#10253d;'>{checkOut}</p>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                  <tr>
                    <td style='padding:0 18px 18px;'>
                      <p style='margin:0;font-size:14px;color:#334e68;'><strong>Booking ID:</strong> {bookingId}</p>
                    </td>
                  </tr>
                </table>

                <p style='margin:18px 2px 0;font-size:14px;color:#48627a;line-height:1.6;'>
                  Open your dashboard to review and manage this booking request.
                </p>
              </td>
            </tr>
            <tr>
              <td style='padding:14px 24px;background:#f1f6fc;border-top:1px solid #dde7f3;color:#58708a;font-size:12px;'>
                This is an automated message from StayEasy.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>";
        }
    }
}
