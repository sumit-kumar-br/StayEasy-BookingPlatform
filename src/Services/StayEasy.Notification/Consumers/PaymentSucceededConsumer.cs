using MassTransit;
using System.Net;
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
            var body = BuildPaymentSucceededEmail(msg);

            await _notificationService.HandleEmailAsync(
                msg.EventId,
                nameof(PaymentSucceededEvent),
                msg.UserId,
                msg.Email,
                subject,
                body,
                context.CancellationToken);
        }

        private static string BuildPaymentSucceededEmail(PaymentSucceededEvent msg)
        {
            var bookingId = WebUtility.HtmlEncode(msg.BookingId.ToString());
            var paymentRef = WebUtility.HtmlEncode(msg.PaymentReference);
            var amount = msg.Amount.ToString("0.00");
            var currency = WebUtility.HtmlEncode(msg.Currency);

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
                <h1 style='margin:10px 0 4px;font-size:26px;line-height:1.2;'>Payment Received</h1>
                <p style='margin:0;font-size:15px;opacity:0.95;'>Your payment has been successfully processed.</p>
              </td>
            </tr>
            <tr>
              <td style='padding:24px;'>
                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border:1px solid #e7edf5;border-radius:10px;background:#f8fbff;'>
                  <tr>
                    <td style='padding:20px 18px;'>
                      <p style='margin:0 0 6px;font-size:13px;color:#5b7189;text-transform:uppercase;letter-spacing:0.6px;'>Payment Amount</p>
                      <p style='margin:0;font-size:32px;font-weight:700;color:#0f2742;'>{currency} {amount}</p>
                    </td>
                  </tr>
                  <tr>
                    <td style='border-top:1px solid #e7edf5;padding:18px 18px;'>
                      <p style='margin:0 0 8px;font-size:13px;color:#5b7189;text-transform:uppercase;letter-spacing:0.6px;'>Booking ID</p>
                      <p style='margin:0 0 14px;font-size:15px;color:#334e68;font-weight:600;'>{bookingId}</p>
                      
                      <p style='margin:0 0 8px;font-size:13px;color:#5b7189;text-transform:uppercase;letter-spacing:0.6px;'>Reference</p>
                      <p style='margin:0;font-size:14px;color:#334e68;font-family:monospace;word-break:break-all;'>{paymentRef}</p>
                    </td>
                  </tr>
                </table>

                <p style='margin:18px 2px 0;font-size:14px;color:#48627a;line-height:1.6;'>
                  Your reservation is now confirmed. Keep this email for your records. If you have questions, contact support with your booking ID.
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