namespace StayEasy.Booking.DTOs
{
    /// <summary>
    /// Represents request and response contracts for HoldResponseDto.
    /// </summary>
    public class HoldResponseDto
    {
        public Guid HoldId { get; set; }
        public Guid HotelId { get; set; }
        public Guid RoomTypeId { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string RoomTypeName { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int Guests { get; set; }
        public decimal TotalAmount { get; set; }
        public DateTime ExpiresAt { get; set; }
        public int MinutesRemaining { get; set; }
    }
}
