namespace StayEasy.Notification.Options
{
    /// <summary>
    /// Represents configuration options for RabbitMqOptions.
    /// </summary>
    public class RabbitMqOptions
    {
        public string Host { get; set; } = "localhost";
        public string VirtualHost { get; set; } = "/";
        public string Username { get; set; } = "guest";
        public string Password { get; set; } = "guest";
    }
}
