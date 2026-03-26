using StayEasy.Shared.Common;
using StayEasy.Search.DTOs;

namespace StayEasy.Search.Services
{
    public interface ISearchService
    {
        Task<ApiResponse<List<HotelSearchResultDto>>> SearchHotelsAsync(HotelSearchRequestDto request);
        Task<ApiResponse<HotelSearchResultDto>> GetHotelDetailAsync(Guid hotelId);
    }
}
