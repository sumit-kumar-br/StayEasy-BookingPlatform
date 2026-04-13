namespace StayEasy.Search.DTOs
{
    /// <summary>
    /// Represents request and response contracts for HotelSearchResultDto.
    /// </summary>
    public class HotelSearchResultDto
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Country { get; set; } = string.Empty;
        public int StarRating { get; set; }
        public string? PhotoUrl { get; set; }
        public decimal LowestPricePerNight { get; set; }
        public int AvailabilityRoomTypes { get; set; }

    }
}
