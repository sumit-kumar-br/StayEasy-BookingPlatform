namespace StayEasy.Hotel.DTOs
{
    /// <summary>
    /// Represents request and response contracts for CreateHotelDto.
    /// </summary>
    public class CreateHotelDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public string Country { get; set;  } = string.Empty;
        public int StarRating { get; set; }
        public double Lattitude { get; set; }
        public double Longitude { get; set; }
    }
}
