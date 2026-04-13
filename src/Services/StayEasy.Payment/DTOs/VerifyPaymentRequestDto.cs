namespace StayEasy.Payment.DTOs
{
    /// <summary>
    /// Represents request and response contracts for VerifyPaymentRequestDto.
    /// </summary>
    public class VerifyPaymentRequestDto
    {
        public Guid BookingId { get; set; }
        public string RazorpayOrderId { get; set; } = string.Empty;
        public string RazorpayPaymentId { get; set; } = string.Empty;
        public string RazorpaySignature { get; set; } = string.Empty;
    }
}
