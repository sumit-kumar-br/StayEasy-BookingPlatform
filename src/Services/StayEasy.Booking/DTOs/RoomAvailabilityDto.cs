namespace StayEasy.Booking.DTOs
{
    public class RoomAvailabilityDto
    {
        public Guid RoomTypeId { get; set; }
        public int TotalUnits { get; set; }
        public int ReservedUnits { get; set; }
        public int AvailableUnits { get; set; }
    }
}
