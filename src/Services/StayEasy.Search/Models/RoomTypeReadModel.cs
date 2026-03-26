namespace StayEasy.Search.Models
{
    public class RoomTypeReadModel
    {
        public Guid Id { get; set; }
        public Guid HotelId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public int MaxOccupancy { get; set; }
        public decimal PricePerNight { get; set; }
        public int TotalRooms { get; set; }
        public string BedConfiguration { get; set; } = string.Empty;
        public string? PhotoUrl {  get; set; }
        public bool IsActive { get; set; }
        public HotelReadModel Hotel { get; set; }
    }
}
