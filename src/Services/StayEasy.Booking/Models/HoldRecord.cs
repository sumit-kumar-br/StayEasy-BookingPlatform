namespace StayEasy.Booking.Models
{
    public class HoldRecord
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid TravelerId { get; set; }
        public Guid RoomTypeId { get; set; }
        public Guid HotelId { get; set; }
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int Guests { get; set; }
        public decimal TotalAmount { get; set; }
        public string HotelName { get; set; } = string.Empty;
        public string RoomTypeName { get; set; } = string.Empty;
        public DateTime ExpiresAt { get; set; }
        public bool IsReleased { get; set; } = false;
        public DateTime CreatedAt { get; set; }
    }
}
