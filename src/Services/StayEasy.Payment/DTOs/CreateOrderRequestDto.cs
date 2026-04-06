namespace StayEasy.Payment.DTOs
{
    public class CreateOrderRequestDto
    {
        public Guid BookingId { get; set; }
        public decimal Amount { get; set; }
        public string Email { get; set; } = string.Empty;
    }
}