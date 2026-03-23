namespace StayEasy.Hotel.DTOs
{
    public class UpdateHotelDto
    {
        public string Name { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public string Address { get; set; } = string.Empty;
        public int StarRating { get; set; }
    }
}
