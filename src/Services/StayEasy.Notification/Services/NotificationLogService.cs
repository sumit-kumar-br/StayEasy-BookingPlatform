using Microsoft.EntityFrameworkCore;
using StayEasy.Notification.Abstractions;
using StayEasy.Notification.Data;
using StayEasy.Notification.Models;

namespace StayEasy.Notification.Services
{
    /// <summary>
    /// Handles idempotent notification logging and email dispatch status tracking.
    /// </summary>
    public class NotificationLogService : INotificationLogService
    {
        private readonly NotificationDbContext _db;
        private readonly IEmailSender _emailSender;
        private readonly ILogger<NotificationLogService> _logger;

        public NotificationLogService(
            NotificationDbContext db,
            IEmailSender emailSender,
            ILogger<NotificationLogService> logger)
        {
            _db = db;
            _emailSender = emailSender;
            _logger = logger;
        }

        /// <summary>
        /// Sends an email notification and persists delivery status for auditing and retries.
        /// </summary>
        public async Task HandleEmailAsync(
            Guid eventId,
            string eventType,
            Guid userId,
            string toEmail,
            string subject,
            string body,
            CancellationToken cancellationToken = default)
        {
            var existing = await _db.NotificationLogs
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.EventId == eventId && x.Channel == NotificationChannel.Email, cancellationToken);

            if (existing != null)
            {
                // Protect against duplicate event delivery on the message bus.
                _logger.LogInformation("Skipping duplicate event {EventId} for email channel", eventId);
                return;
            }

            var log = new NotificationLog
            {
                EventId = eventId,
                EventType = eventType,
                UserId = userId,
                Email = toEmail,
                Subject = subject,
                Body = body,
                Channel = NotificationChannel.Email,
                Status = NotificationStatus.Pending,
                AttemptCount = 1
            };

            _db.NotificationLogs.Add(log);
            await _db.SaveChangesAsync(cancellationToken);

            try
            {
                await _emailSender.SendAsync(toEmail, subject, body, cancellationToken);
                log.Status = NotificationStatus.Sent;
                log.SentAtUtc = DateTime.UtcNow;
                log.ErrorMessage = null;
            }
            catch (Exception ex)
            {
                log.Status = NotificationStatus.Failed;
                log.ErrorMessage = ex.Message;
                _logger.LogError(ex, "Failed to send email for event {EventId}", eventId);
                throw;
            }

            await _db.SaveChangesAsync(cancellationToken);
        }
    }
}
