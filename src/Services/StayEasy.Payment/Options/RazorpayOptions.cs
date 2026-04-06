namespace StayEasy.Payment.Options
{
    public class RazorpayOptions
    {
        public string KeyId { get; set; } = string.Empty;
        public string KeySecret { get; set; } = string.Empty;
        public string Currency { get; set; } = "INR";
    }
}