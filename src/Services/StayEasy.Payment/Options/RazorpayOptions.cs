namespace StayEasy.Payment.Options
{
    /// <summary>
    /// Represents configuration options for RazorpayOptions.
    /// </summary>
    public class RazorpayOptions
    {
        public string KeyId { get; set; } = string.Empty;
        public string KeySecret { get; set; } = string.Empty;
        public string Currency { get; set; } = "INR";
    }
}
