using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StayEasy.Search.Services;
using StayEasy.Search.DTOs;

namespace StayEasy.Search.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    /// <summary>
    /// Handles HTTP endpoints for SearchController.
    /// </summary>
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }
        [HttpGet("hotels")]
        /// <summary>
        /// Retrieves data for SearchHotels.
        /// </summary>
        public async Task<IActionResult> SearchHotels([FromQuery] HotelSearchRequestDto request)
        {
            var result = await _searchService.SearchHotelsAsync(request);
            return Ok(result);
        }
        [HttpGet("Hotels/{id}")]
        /// <summary>
        /// Retrieves data for GetHotelDetail.
        /// </summary>
        public async Task<IActionResult> GetHotelDetail(Guid id)
        {
            var result = await _searchService.GetHotelDetailAsync(id);
            return Ok(result);
        }
    }
}
