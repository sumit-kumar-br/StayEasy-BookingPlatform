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
    /// Handles HTTP endpoints for RoomsController.
    /// </summary>
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;
        public RoomsController(IRoomService roomService)
        {
            _roomService = roomService;
        }
        [HttpPost]
        [Authorize(Roles = "HotelManager")]
        /// <summary>
        /// Creates resources for CreateRoomType.
        /// </summary>
        public async Task<IActionResult> CreateRoomType(Guid hotelId, [FromBody] CreateRoomTypeDto dto)
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _roomService.CreateRoomTypeAsync(hotelId, dto, managerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpGet]
        /// <summary>
        /// Retrieves data for GetRoomTypes.
        /// </summary>
        public async Task<IActionResult> GetRoomTypes(Guid hotelId)
        {
            var result = await _roomService.GetRoomTypesAsync(hotelId);
            return Ok(result);
        }
        [HttpDelete("{roomTypeId}")]
        [Authorize(Roles = "HotelManager")]
        /// <summary>
        /// Removes or cancels resources via DeleteRoomAsync.
        /// </summary>
        public async Task<IActionResult> DeleteRoomAsync(Guid hotelId, Guid roomTypeId)
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _roomService.DeleteRoomTypeAsync(roomTypeId, managerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{roomTypeId}/photo")]
        [Authorize(Roles = "HotelManager")]
        /// <summary>
        /// Executes UploadRoomPhoto business operation.
        /// </summary>
        public async Task<IActionResult> UploadRoomPhoto(Guid roomTypeId, [FromForm] PhotoUploadRequestDto request)
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _roomService.UploadPhotoAsync(roomTypeId, request.File, managerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
