namespace StayEasy.Booking.DTOs
{
    /// <summary>
    /// Represents request and response contracts for RoomAvailabilityDto.
    /// </summary>
    public class RoomAvailabilityDto
    {
        public Guid RoomTypeId { get; set; }
        public int TotalUnits { get; set; }
        public int ReservedUnits { get; set; }
        public int AvailableUnits { get; set; }
    }
}
