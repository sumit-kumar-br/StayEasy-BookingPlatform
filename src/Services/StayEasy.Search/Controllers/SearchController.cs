using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StayEasy.Search.Services;
using StayEasy.Search.DTOs;

namespace StayEasy.Search.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SearchController : ControllerBase
    {
        private readonly ISearchService _searchService;
        public SearchController(ISearchService searchService)
        {
            _searchService = searchService;
        }
        [HttpGet("hotels")]
        public async Task<IActionResult> SearchHotels([FromQuery] HotelSearchRequestDto request)
        {
            var result = await _searchService.SearchHotelsAsync(request);
            return Ok(result);
        }
        [HttpGet("Hotels/{id}")]
        public async Task<IActionResult> GetHotelDetail(Guid id)
        {
            var result = await _searchService.GetHotelDetailAsync(id);
            return Ok(result);
        }
    }
}
