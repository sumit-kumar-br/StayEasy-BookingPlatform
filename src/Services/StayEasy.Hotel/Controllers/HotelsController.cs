using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StayEasy.Hotel.DTOs;
using StayEasy.Hotel.Services;
using System.Security.Claims;

namespace StayEasy.Hotel.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    /// <summary>
    /// Handles HTTP endpoints for HotelsController.
    /// </summary>
    public class HotelsController : ControllerBase
    {
        private readonly IHotelService _hotelService;
        public HotelsController(IHotelService hotelService)
        {
            _hotelService = hotelService;
        }
        [HttpPost]
        [Authorize(Roles = "HotelManager")]
        /// <summary>
        /// Creates resources for CreateHotel.
        /// </summary>
        public async Task<IActionResult> CreateHotel([FromBody] CreateHotelDto dto)
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _hotelService.CreateHotelAsync(dto, managerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpGet("{id}")]
        /// <summary>
        /// Retrieves data for GetHotel.
        /// </summary>
        public async Task<IActionResult> GetHotel(Guid id)
        {
            var result = await _hotelService.GetHotelByIdAsync(id);
            return Ok(result);
        }
        [HttpGet("my")]
        [Authorize(Roles="HotelManager")]
        /// <summary>
        /// Retrieves data for GetMyHotels.
        /// </summary>
        public async Task<IActionResult> GetMyHotels()
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _hotelService.GetMyHotelsAsync(managerId);
            return Ok(result);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        /// <summary>
        /// Retrieves data for GetAllHotels.
        /// </summary>
        public async Task<IActionResult> GetAllHotels()
        {
            var result = await _hotelService.GetAllHotelsAsync();
            return Ok(result);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "HotelManager")]
        /// <summary>
        /// Updates state via UpdateHotel.
        /// </summary>
        public async Task<IActionResult> UpdateHotel(Guid id, [FromBody] UpdateHotelDto dto)
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _hotelService.UpdateHotelAsync(id, dto, managerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpPatch("{id}/approve")]
        [Authorize(Roles = "Admin")]
        /// <summary>
        /// Updates state via ApproveHotel.
        /// </summary>
        public async Task<IActionResult> ApproveHotel(Guid id)
        {
            var result = await _hotelService.ApproveHotelAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpPatch("{id}/reject")]
        [Authorize(Roles ="Admin")]
        /// <summary>
        /// Updates state via RejectHotel.
        /// </summary>
        public async Task<IActionResult> RejectHotel(Guid id)
        {
            var result = await _hotelService.RejectHotelAsync(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpPost("{id}/photo")]
        [Authorize(Roles = "HotelManager")]
        /// <summary>
        /// Executes UploadPhoto business operation.
        /// </summary>
        public async Task<IActionResult> UploadPhoto(Guid id, [FromForm] PhotoUploadRequestDto request)
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _hotelService.UploadPhotoAsync(id, request.File, managerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
