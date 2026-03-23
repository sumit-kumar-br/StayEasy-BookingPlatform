using StayEasy.Shared.Enums;

namespace StayEasy.Hotel.Models
{
    public class Hotel
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public Guid ManagerId {  get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address {  get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int StarRating { get; set; }
        public PropertyStatus Status { get; set; } = PropertyStatus.PendingReview;
        public double Lattitude { get; set; }
        public double Longitude { get; set; }
        public string? PhotoUrl { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<RoomType> RoomTypes { get; set; } = new List<RoomType>();

    }
}
