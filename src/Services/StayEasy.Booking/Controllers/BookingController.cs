using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using StayEasy.Booking.DTOs;
using StayEasy.Booking.Services;
using System.Security.Claims;

namespace StayEasy.Booking.Controllers
{
    [Route("api/bookings")]
    [ApiController]
    [Authorize]
    public class BookingController : ControllerBase
    {
        private readonly IBookingService _bookingService;
        public BookingController(IBookingService bookingService)
        {
            _bookingService = bookingService;
        }
        [HttpPost("hold")]
        public async Task<IActionResult> CreateHold([FromBody] CreateHoldDto dto)
        {
            var travelerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _bookingService.CreateHoldAsync(dto, travelerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpGet("hold/{holdId}")]
        public async Task<IActionResult> GetHold(Guid holdId)
        {
            var result = await _bookingService.GetHoldAsync(holdId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpDelete("hold/{holdId}")]
        public async Task<IActionResult> ReleaseHold(Guid holdId)
        {
            var result = await _bookingService.ReleaseHoldAsync(holdId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpPost("confirm")]
        public async Task<IActionResult> ConfirmBooking([FromBody] CreateBookingDto dto)
        {
            var travelerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _bookingService.ConfirmBookingAsync(dto, travelerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
        [HttpPost("{bookingId}/cancel")]
        public async Task<IActionResult> CancelBooking(Guid bookingId)
        {
            var travelerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _bookingService.CancelBookingAsync(bookingId, travelerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{bookingId}/manager-cancel")]
        [Authorize(Roles = "HotelManager")]
        public async Task<IActionResult> CancelBookingAsManager(Guid bookingId)
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _bookingService.CancelBookingAsManagerAsync(bookingId, managerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("{bookingId}/manager-confirm")]
        [Authorize(Roles = "HotelManager")]
        public async Task<IActionResult> ConfirmBookingAsManager(Guid bookingId)
        {
            var managerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _bookingService.ConfirmBookingAsManagerAsync(bookingId, managerId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("my")]
        public async Task<IActionResult> GetMyBookings()
        {
            var travelerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _bookingService.GetMyBookingsAsync(travelerId);
            return Ok(result);
        }
        [HttpGet("{bookingId}")]
        public async Task<IActionResult> GetBookingById(Guid bookingId)
        {
            var travelerId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var result = await _bookingService.GetBookingByIdAsync(bookingId, travelerId);
            return Ok(result);
        }

        [HttpGet("incoming")]
        [Authorize(Roles = "HotelManager,Admin")]
        public async Task<IActionResult> GetIncomingBookings()
        {
            var result = await _bookingService.GetIncomingBookingsAsync();
            return Ok(result);
        }
    }
}
