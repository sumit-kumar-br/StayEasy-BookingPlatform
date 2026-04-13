using System.Net;
using System.Net.Mail;
using Microsoft.Extensions.Options;
using StayEasy.Notification.Abstractions;
using StayEasy.Notification.Options;

namespace StayEasy.Notification.Services
{
    /// <summary>
    /// SMTP-backed implementation of <see cref="IEmailSender"/>.
    /// </summary>
    public class SmtpEmailSender : IEmailSender
    {
        private readonly SmtpOptions _smtp;

        public SmtpEmailSender(IOptions<SmtpOptions> smtpOptions)
        {
            _smtp = smtpOptions.Value;
        }

        /// <summary>
        /// Sends an HTML email through configured SMTP credentials.
        /// </summary>
        public async Task SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default)
        {
            using var client = new SmtpClient(_smtp.Host, _smtp.Port)
            {
                EnableSsl = true,
                Credentials = new NetworkCredential(_smtp.Username, _smtp.Password)
            };

            using var message = new MailMessage
            {
                From = new MailAddress(_smtp.FromEmail, _smtp.FromName),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };

            message.To.Add(toEmail);

            cancellationToken.ThrowIfCancellationRequested();
            await client.SendMailAsync(message);
        }
    }
}
