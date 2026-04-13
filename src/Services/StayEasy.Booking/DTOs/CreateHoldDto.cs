namespace StayEasy.Booking.DTOs
{
    /// <summary>
    /// Represents request and response contracts for CreateHoldDto.
    /// </summary>
    public class CreateHoldDto
    {
        public Guid HotelId { get; set; }
        public Guid RoomTypeId { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string RoomTypeName { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int Guests { get; set; }
        public decimal TotalAmount { get; set; }

    }
}
