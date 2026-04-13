namespace StayEasy.Hotel.DTOs
{
    /// <summary>
    /// Represents request and response contracts for UpdateHotelDto.
    /// </summary>
    public class UpdateHotelDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int StarRating { get; set; }
    }
}
