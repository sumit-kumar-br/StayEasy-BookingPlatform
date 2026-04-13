namespace StayEasy.Payment.DTOs
{
    /// <summary>
    /// Represents request and response contracts for CreateOrderRequestDto.
    /// </summary>
    public class CreateOrderRequestDto
    {
        public Guid BookingId { get; set; }
        public decimal Amount { get; set; }
        public string Email { get; set; } = string.Empty;
    }
}
