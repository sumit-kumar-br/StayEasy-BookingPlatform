using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using StayEasy.Auth.DTOs;
using StayEasy.Auth.Services;

namespace StayEasy.Auth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    /// <summary>
    /// Handles HTTP endpoints for AuthController.
    /// </summary>
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        /// <summary>
        /// Creates resources for Register.
        /// </summary>
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("login")]
        /// <summary>
        /// Executes Login business operation.
        /// </summary>
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            return result.Success ? Ok(result) : Unauthorized(result);
        }

        [HttpPost("refresh-token")]
        /// <summary>
        /// Executes RefreshToken business operation.
        /// </summary>
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequestDto dto)
        {
            var result = await _authService.RefreshTokenAsync(dto.RefreshToken);
            return result.Success ? Ok(result) : Unauthorized(result);
        }

        [HttpGet("verify-email")]
        /// <summary>
        /// Updates state via VerifyEmail.
        /// </summary>
        public async Task<IActionResult> VerifyEmail([FromQuery] string token)
        {
            var result = await _authService.VerifyEmailAsync(token);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("verify-email")]
        /// <summary>
        /// Updates state via VerifyEmailPost.
        /// </summary>
        public async Task<IActionResult> VerifyEmailPost([FromBody] string token)
        {
            var result = await _authService.VerifyEmailAsync(token);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("logout")]
        /// <summary>
        /// Executes Logout business operation.
        /// </summary>
        public async Task<IActionResult> Logout([FromBody] TokenRequestDto dto)
        {
            var result = await _authService.LogoutAsync(dto.RefreshToken);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        /// <summary>
        /// Retrieves data for GetUsers.
        /// </summary>
        public async Task<IActionResult> GetUsers()
        {
            var result = await _authService.GetUsersAsync();
            return Ok(result);
        }

        [HttpGet("internal/users/{userId}")]
        [AllowAnonymous]
        /// <summary>
        /// Retrieves data for GetUserContact.
        /// </summary>
        public async Task<IActionResult> GetUserContact(Guid userId)
        {
            var result = await _authService.GetUserContactAsync(userId);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPatch("users/{userId}/ban")]
        [Authorize(Roles = "Admin")]
        /// <summary>
        /// Executes BanUser business operation.
        /// </summary>
        public async Task<IActionResult> BanUser(Guid userId)
        {
            var result = await _authService.BanUserAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPatch("users/{userId}/unban")]
        [Authorize(Roles = "Admin")]
        /// <summary>
        /// Executes UnbanUser business operation.
        /// </summary>
        public async Task<IActionResult> UnbanUser(Guid userId)
        {
            var result = await _authService.UnbanUserAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPatch("users/{userId}/verify")]
        [Authorize(Roles = "Admin")]
        /// <summary>
        /// Updates state via VerifyUser.
        /// </summary>
        public async Task<IActionResult> VerifyUser(Guid userId)
        {
            var result = await _authService.VerifyUserAsAdminAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
