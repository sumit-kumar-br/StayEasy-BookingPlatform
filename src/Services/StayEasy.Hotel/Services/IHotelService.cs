using StayEasy.Hotel.DTOs;
using StayEasy.Shared.Common;

namespace StayEasy.Hotel.Services
{
    /// <summary>
    /// Defines hotel management operations for managers and admins.
    /// </summary>
    public interface IHotelService
    {
        /// <summary>
        /// Creates a hotel listing owned by the specified manager.
        /// </summary>
        Task<ApiResponse<HotelResponseDto>> CreateHotelAsync(CreateHotelDto dto, Guid managerId);

        /// <summary>
        /// Returns hotel details by identifier.
        /// </summary>
        Task<ApiResponse<HotelResponseDto>> GetHotelByIdAsync(Guid hotelId);

        /// <summary>
        /// Lists all hotels for a specific manager.
        /// </summary>
        Task<ApiResponse<List<HotelResponseDto>>> GetMyHotelsAsync(Guid managerId);

        /// <summary>
        /// Lists all hotels for admin or public browse contexts.
        /// </summary>
        Task<ApiResponse<List<HotelResponseDto>>> GetAllHotelsAsync();

        /// <summary>
        /// Updates hotel details for a manager-owned listing.
        /// </summary>
        Task<ApiResponse<HotelResponseDto>> UpdateHotelAsync(Guid hotelId, UpdateHotelDto dto, Guid managerId);

        /// <summary>
        /// Approves a hotel listing during moderation.
        /// </summary>
        Task<ApiResponse<bool>> ApproveHotelAsync(Guid hotelId);

        /// <summary>
        /// Rejects a hotel listing during moderation.
        /// </summary>
        Task<ApiResponse<bool>> RejectHotelAsync(Guid hotelId);

        /// <summary>
        /// Uploads a primary hotel photo for a manager-owned listing.
        /// </summary>
        Task<ApiResponse<bool>> UploadPhotoAsync(Guid hotelId, IFormFile photo, Guid managerId);
    }
}
