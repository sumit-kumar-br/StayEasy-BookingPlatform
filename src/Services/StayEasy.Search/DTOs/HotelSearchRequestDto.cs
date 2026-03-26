namespace StayEasy.Search.DTOs
{
    public class HotelSearchRequestDto
    {
        public string City { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int Guests { get; set; } = 1;
        public int? MinStars { get; set; }
        public int? MaxStars { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
    }
}
