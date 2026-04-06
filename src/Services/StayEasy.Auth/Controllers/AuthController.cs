using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using StayEasy.Auth.DTOs;
using StayEasy.Auth.Services;

namespace StayEasy.Auth.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        public AuthController(IAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var result = await _authService.RegisterAsync(dto);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var result = await _authService.LoginAsync(dto);
            return result.Success ? Ok(result) : Unauthorized(result);
        }

        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] TokenRequestDto dto)
        {
            var result = await _authService.RefreshTokenAsync(dto.RefreshToken);
            return result.Success ? Ok(result) : Unauthorized(result);
        }

        [HttpPost("verify-email")]
        public async Task<IActionResult> VerifyEmail([FromBody] string token)
        {
            var result = await _authService.VerifyEmailAsync(token);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("logout")]
        public async Task<IActionResult> Logout([FromBody] TokenRequestDto dto)
        {
            var result = await _authService.LogoutAsync(dto.RefreshToken);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("users")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetUsers()
        {
            var result = await _authService.GetUsersAsync();
            return Ok(result);
        }

        [HttpPatch("users/{userId}/ban")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> BanUser(Guid userId)
        {
            var result = await _authService.BanUserAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPatch("users/{userId}/unban")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UnbanUser(Guid userId)
        {
            var result = await _authService.UnbanUserAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPatch("users/{userId}/verify")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> VerifyUser(Guid userId)
        {
            var result = await _authService.VerifyUserAsAdminAsync(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}
