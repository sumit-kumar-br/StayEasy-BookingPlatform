namespace StayEasy.Booking.DTOs
{
    /// <summary>
    /// Represents request and response contracts for BookingResponseDto.
    /// </summary>
    public class BookingResponseDto
    {
        public Guid Id { get; set; }
        public string BookingRef { get; set; } = string.Empty;
        public Guid HotelId { get; set; }
        public Guid RoomTypeId { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string RoomTypeName { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public string GuestEmail { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int Guests { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? SpecialRequests { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
