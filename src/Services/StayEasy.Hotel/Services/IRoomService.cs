using StayEasy.Hotel.DTOs;
using StayEasy.Shared.Common;

namespace StayEasy.Hotel.Services
{
    /// <summary>
    /// Defines room-type management operations under a hotel listing.
    /// </summary>
    public interface IRoomService
    {
        /// <summary>
        /// Creates a room type within a manager-owned hotel.
        /// </summary>
        Task<ApiResponse<RoomTypeResponseDto>> CreateRoomTypeAsync(Guid hotelId, CreateRoomTypeDto dto, Guid managerId);

        /// <summary>
        /// Returns all room types for a hotel.
        /// </summary>
        Task<ApiResponse<List<RoomTypeResponseDto>>> GetRoomTypesAsync(Guid hotelId);

        /// <summary>
        /// Deletes a room type when allowed by business constraints.
        /// </summary>
        Task<ApiResponse<bool>> DeleteRoomTypeAsync(Guid roomTypeId, Guid managerId);

        /// <summary>
        /// Uploads a room photo for a manager-owned room type.
        /// </summary>
        Task<ApiResponse<bool>> UploadPhotoAsync(Guid roomTypeId, IFormFile photo, Guid managerId);
    }
}
