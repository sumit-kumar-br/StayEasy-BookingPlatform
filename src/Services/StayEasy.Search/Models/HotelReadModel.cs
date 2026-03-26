namespace StayEasy.Search.Models
{
    public class HotelReadModel
    {
        public Guid Id { get; set; }
        public Guid ManagerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int StarRating { get; set; }
        public string Status { get; set; } = string.Empty;
        public double Lattitude { get; set; }
        public double Longitude { get; set; }
        public string? PhotoUrl { get; set; }
        public DateTime CreatedAt { get; set; }
        public ICollection<RoomTypeReadModel> RoomTypes { get; set; } = new List<RoomTypeReadModel>();

    }
}
