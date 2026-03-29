namespace StayEasy.Booking.DTOs
{
    public class CreateBookingDto
    {
        public Guid HoldId {  get; set; }
        public string GuestName { get; set; } = string.Empty;
        public string GuestEmail { get; set; } = string.Empty;
        public string? SpecialRequests { get; set; }
    }
}
