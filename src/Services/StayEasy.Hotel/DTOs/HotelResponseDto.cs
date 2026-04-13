namespace StayEasy.Hotel.DTOs
{
    /// <summary>
    /// Represents request and response contracts for HotelResponseDto.
    /// </summary>
    public class HotelResponseDto
    {
        public Guid Id { get; set; }
        public Guid ManagerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set;  } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int StarRating {  get; set; }
        public string Status { get; set; } = string.Empty;
        public string? PhotoUrl { get; set; }
        public List<RoomTypeResponseDto> RoomTypes { get; set; } = new();
    }
}
