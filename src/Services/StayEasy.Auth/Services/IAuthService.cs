using StayEasy.Auth.DTOs;
using StayEasy.Shared.Common;

namespace StayEasy.Auth.Services
{
    public interface IAuthService
    {
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto);
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto);
        Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string refreshToken);
        Task<ApiResponse<bool>> VerifyEmailAsync(string token);
        Task<ApiResponse<bool>> LogoutAsync(string refreshToken);
        Task<ApiResponse<List<AdminUserDto>>> GetUsersAsync();
        Task<ApiResponse<bool>> BanUserAsync(Guid userId);
        Task<ApiResponse<bool>> UnbanUserAsync(Guid userId);
        Task<ApiResponse<bool>> VerifyUserAsAdminAsync(Guid userId);
    }
}
