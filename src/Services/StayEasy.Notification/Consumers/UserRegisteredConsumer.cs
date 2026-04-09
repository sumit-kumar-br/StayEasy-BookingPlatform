using MassTransit;
using System.Net;
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
            var body = BuildUserRegisteredEmail(msg);

            await _notificationService.HandleEmailAsync(
                msg.EventId,
                nameof(UserRegisteredEvent),
                msg.UserId,
                msg.Email,
                subject,
                body,
                context.CancellationToken);
        }

                private static string BuildUserRegisteredEmail(UserRegisteredEvent msg)
                {
                        var fullName = WebUtility.HtmlEncode(msg.FullName);

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
                                <h1 style='margin:10px 0 4px;font-size:26px;line-height:1.2;'>Welcome to StayEasy</h1>
                                <p style='margin:0;font-size:15px;opacity:0.95;'>Your account has been created successfully.</p>
                            </td>
                        </tr>
                        <tr>
                            <td style='padding:24px;'>
                                <table role='presentation' width='100%' cellspacing='0' cellpadding='0' style='border:1px solid #e7edf5;border-radius:10px;background:#f8fbff;'>
                                    <tr>
                                        <td style='padding:18px;'>
                                            <p style='margin:0 0 8px;font-size:13px;color:#5b7189;text-transform:uppercase;letter-spacing:0.6px;'>Account Holder</p>
                                            <p style='margin:0;font-size:21px;font-weight:700;color:#0f2742;'>{fullName}</p>
                                        </td>
                                    </tr>
                                </table>

                                <p style='margin:18px 2px 0;font-size:14px;color:#48627a;line-height:1.6;'>
                                    You can now sign in and start booking stays on StayEasy.
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