using StayEasy.Shared.Enums;

namespace StayEasy.Booking.Models
{
    public class Booking
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string BookingRef { get; set; } = string.Empty;
        public Guid TravelerId { get; set; }
        public Guid HotelId { get; set; }
        public Guid RoomTypeId { get; set; }
        public string HotelName {  get; set; } = string.Empty;
        public string RoomTypeName { get; set; } = string.Empty;
        public string GuestName { get; set; } = string.Empty;
        public string GuestEmail { get; set; } = string.Empty;
        public DateTime CheckIn { get; set; }
        public DateTime CheckOut { get; set; }
        public int Guests { get; set; }
        public decimal TotalAmount { get; set; }
        public BookingStatus Status = BookingStatus.Pending;
        public string? SpecialRequests { get; set; }
        public string? StripePaymentIntentId { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime CancelledAt { get; set; }
    }
}
