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
    public class RoomsController : ControllerBase
    {
        private readonly IRoomService _roomService;
        public RoomsController(IRoomService roomService)
        {
            _roomService = roomService;
        }
        [HttpPost]
        [Authorize(Roles = "HotelManager")]
        public async Task<IActionResult> CreateRoomType(Guid hotelId, [FromBody] CreateRoomTypeDto dto)
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));
            var result = await _roomService.CreateRoomTypeAsync(hotelId, dto, managerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpGet]
        public async Task<IActionResult> GetRoomTypes(Guid hotelId)
        {
            var result = await _roomService.GetRoomTypesAsync(hotelId);
            return Ok(result);
        }
        [HttpDelete("{roomTypeId}")]
        [Authorize(Roles = "HotelManager")]
        public async Task<IActionResult> DeleteRoomAsync(Guid hotelId, Guid roomTypeId)
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _roomService.DeleteRoomTypeAsync(roomTypeId, managerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
