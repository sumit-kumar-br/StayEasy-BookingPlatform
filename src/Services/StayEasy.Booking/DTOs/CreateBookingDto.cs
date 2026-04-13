namespace StayEasy.Booking.DTOs
{
    /// <summary>
    /// Represents request and response contracts for CreateBookingDto.
    /// </summary>
    public class CreateBookingDto
    {
        public Guid HoldId {  get; set; }
        public string GuestName { get; set; } = string.Empty;
        public string GuestEmail { get; set; } = string.Empty;
        public string? SpecialRequests { get; set; }
    }
}
