namespace StayEasy.Notification.Abstractions
{
    /// <summary>
    /// Sends outbound emails through the configured notification channel.
    /// </summary>
    public interface IEmailSender
    {
        /// <summary>
        /// Sends an email message.
        /// </summary>
        Task SendAsync(string toEmail, string subject, string body, CancellationToken cancellationToken = default);
    }
}
