using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using StayEasy.Payment.DTOs;
using StayEasy.Payment.Services;

namespace StayEasy.Payment.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    /// <summary>
    /// Handles HTTP endpoints for PaymentsController.
    /// </summary>
    public class PaymentsController : ControllerBase
    {
        private readonly IPaymentService _paymentService;

        public PaymentsController(IPaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost("create-order")]
        /// <summary>
        /// Creates resources for CreateOrder.
        /// </summary>
        public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequestDto dto)
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var result = await _paymentService.CreateOrderAsync(dto, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("verify")]
        /// <summary>
        /// Updates state via Verify.
        /// </summary>
        public async Task<IActionResult> Verify([FromBody] VerifyPaymentRequestDto dto)
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var result = await _paymentService.VerifyPaymentAsync(dto, userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{bookingId:guid}")]
        /// <summary>
        /// Retrieves data for GetStatus.
        /// </summary>
        public async Task<IActionResult> GetStatus(Guid bookingId)
        {
            if (!TryGetUserId(out var userId))
            {
                return Unauthorized();
            }

            var result = await _paymentService.GetPaymentStatusAsync(bookingId, userId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        private bool TryGetUserId(out Guid userId)
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            return Guid.TryParse(value, out userId);
        }
    }
}
