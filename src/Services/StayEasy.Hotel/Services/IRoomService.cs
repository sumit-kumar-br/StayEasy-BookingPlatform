using StayEasy.Hotel.DTOs;
using StayEasy.Shared.Common;

namespace StayEasy.Hotel.Services
{
    public interface IRoomService
    {
        Task<ApiResponse<RoomTypeResponseDto>> CreateRoomTypeAsync(Guid hotelId, CreateRoomTypeDto dto, Guid managerId);
        Task<ApiResponse<List<RoomTypeResponseDto>>> GetRoomTypesAsync(Guid hotelId);
        Task<ApiResponse<bool>> DeleteRoomTypeAsync(Guid roomTypeId, Guid managerId);
        Task<ApiResponse<bool>> UploadPhotoAsync(Guid roomTypeId, IFormFile photo, Guid managerId);
    }
}
