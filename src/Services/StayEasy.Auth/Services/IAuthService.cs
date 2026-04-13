using StayEasy.Auth.DTOs;
using StayEasy.Shared.Common;

namespace StayEasy.Auth.Services
{
    /// <summary>
    /// Defines authentication and user-account operations for the Auth service.
    /// </summary>
    public interface IAuthService
    {
        /// <summary>
        /// Registers a new user account and triggers verification messaging.
        /// </summary>
        Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto);

        /// <summary>
        /// Validates credentials and returns access/refresh tokens.
        /// </summary>
        Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto);

        /// <summary>
        /// Issues a new token pair for a valid refresh token.
        /// </summary>
        Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string refreshToken);

        /// <summary>
        /// Marks a user as verified using the email verification token.
        /// </summary>
        Task<ApiResponse<bool>> VerifyEmailAsync(string token);

        /// <summary>
        /// Revokes an active refresh token and logs the user out.
        /// </summary>
        Task<ApiResponse<bool>> LogoutAsync(string refreshToken);

        /// <summary>
        /// Retrieves users for admin management screens.
        /// </summary>
        Task<ApiResponse<List<AdminUserDto>>> GetUsersAsync();

        /// <summary>
        /// Gets contact details for cross-service operations such as notifications.
        /// </summary>
        Task<ApiResponse<UserContactDto>> GetUserContactAsync(Guid userId);

        /// <summary>
        /// Suspends a user account.
        /// </summary>
        Task<ApiResponse<bool>> BanUserAsync(Guid userId);

        /// <summary>
        /// Re-enables a previously banned user account.
        /// </summary>
        Task<ApiResponse<bool>> UnbanUserAsync(Guid userId);

        /// <summary>
        /// Allows an administrator to verify a user account manually.
        /// </summary>
        Task<ApiResponse<bool>> VerifyUserAsAdminAsync(Guid userId);
    }
}
