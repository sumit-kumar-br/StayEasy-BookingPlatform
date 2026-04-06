using StayEasy.Hotel.DTOs;
using StayEasy.Shared.Common;

namespace StayEasy.Hotel.Services
{
    public interface IHotelService
    {
        Task<ApiResponse<HotelResponseDto>> CreateHotelAsync(CreateHotelDto dto, Guid managerId);
        Task<ApiResponse<HotelResponseDto>> GetHotelByIdAsync(Guid hotelId);
        Task<ApiResponse<List<HotelResponseDto>>> GetMyHotelsAsync(Guid managerId);
        Task<ApiResponse<List<HotelResponseDto>>> GetAllHotelsAsync();
        Task<ApiResponse<HotelResponseDto>> UpdateHotelAsync(Guid hotelId, UpdateHotelDto dto, Guid managerId);
        Task<ApiResponse<bool>> ApproveHotelAsync(Guid hotelId);
        Task<ApiResponse<bool>> RejectHotelAsync(Guid hotelId);
        Task<ApiResponse<bool>> UploadPhotoAsync(Guid hotelId, IFormFile photo, Guid managerId);
    }
}
