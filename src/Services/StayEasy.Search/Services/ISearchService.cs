using StayEasy.Shared.Common;
using StayEasy.Search.DTOs;

namespace StayEasy.Search.Services
{
    /// <summary>
    /// Defines hotel discovery and detail lookup operations.
    /// </summary>
    public interface ISearchService
    {
        /// <summary>
        /// Searches hotels by destination and stay filters.
        /// </summary>
        Task<ApiResponse<List<HotelSearchResultDto>>> SearchHotelsAsync(HotelSearchRequestDto request);

        /// <summary>
        /// Retrieves a single hotel detail projection for search results.
        /// </summary>
        Task<ApiResponse<HotelSearchResultDto>> GetHotelDetailAsync(Guid hotelId);
    }
}
