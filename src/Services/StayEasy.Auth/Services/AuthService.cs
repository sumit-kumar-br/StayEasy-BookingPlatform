using Microsoft.EntityFrameworkCore;
using MassTransit;
using StayEasy.Auth.Data;
using StayEasy.Auth.DTOs;
using StayEasy.Auth.Models;
using StayEasy.Shared.Common;
using StayEasy.Shared.Contracts.Notifications;
using StayEasy.Shared.JWT;

namespace StayEasy.Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly AuthDbContext _db;
        private readonly JwtTokenGenerator _jwtGenerator;
        private readonly JwtSettings _jwtSettings;
        private readonly IPublishEndpoint _publishEndpoint;
        public AuthService(
            AuthDbContext db,
            JwtTokenGenerator jwtGenerator,
            JwtSettings jwtSettings,
            IPublishEndpoint publishEndpoint)
        {
            _db = db;
            _jwtGenerator = jwtGenerator;
            _jwtSettings = jwtSettings;
            _publishEndpoint = publishEndpoint;
        }
        public async Task<ApiResponse<AuthResponseDto>> RegisterAsync(RegisterDto dto)
        {
            // Check if email already exists
            if(await _db.Users.AnyAsync(u => u.Email == dto.Email.ToLower()))
            {
                return ApiResponse<AuthResponseDto>.Fail("An account with this email already exists.");
            }
            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                MobileNumber = dto.MobileNumber,
                Role = dto.Role,
                VerificationToken = Guid.NewGuid().ToString("N"),
                VerificationTokenExpiry = DateTime.UtcNow.AddHours(24)
            };
            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            await _publishEndpoint.Publish(new UserRegisteredEvent
            {
                EventId = Guid.NewGuid(),
                OccurredAtUtc = DateTime.UtcNow,
                CorrelationId = Guid.NewGuid().ToString("N"),
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email
            });

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString()
            }, "Registration successful. Please Verify your email.");
        }


        public async Task<ApiResponse<AuthResponseDto>> LoginAsync(LoginDto dto)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return ApiResponse<AuthResponseDto>.Fail("Invalid email or password.");

            if (user.IsBanned)
                return ApiResponse<AuthResponseDto>.Fail("Your account has been banned.");

            if (!user.IsVerified)
                return ApiResponse<AuthResponseDto>.Fail("Please verify your email before logging in.");

            // Generate Tokens
            var accessToken = _jwtGenerator.GenerateToken(user.Id, user.Email, user.Role);
            var refreshToken = Guid.NewGuid().ToString("N");

            // Save refresh token
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);
            user.LastLoginAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                AccessToken = accessToken,
                ReferenceToken = refreshToken
            });
        }

        public async Task<ApiResponse<AuthResponseDto>> RefreshTokenAsync(string refreshToken)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken 
                                                            && u.RefreshTokenExpiry > DateTime.UtcNow);

            if (user == null)
                return ApiResponse<AuthResponseDto>.Fail("Invalid or expired refresh token.");

            var newAccessToken = _jwtGenerator.GenerateToken(user.Id, user.Email, user.Role);
            var newRefreshToken = Guid.NewGuid().ToString("N");

            user.RefreshToken = newRefreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenExpiryDays);
            await _db.SaveChangesAsync();

            return ApiResponse<AuthResponseDto>.Ok(new AuthResponseDto
            {
                UserId = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString(),
                AccessToken = newAccessToken,
                ReferenceToken = newRefreshToken
            });
        }

        public async Task<ApiResponse<bool>> VerifyEmailAsync(string token)
        {
            var user = await _db.Users.FirstOrDefaultAsync(u => u.VerificationToken == token && 
                                                            u.VerificationTokenExpiry > DateTime.UtcNow);

            if (user == null)
                return ApiResponse<bool>.Fail("Invalid or expired verification token.");

            user.IsVerified = true;
            user.VerificationToken = null;
            user.VerificationTokenExpiry = null;
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Email verified successfully.");
        }

        public async Task<ApiResponse<bool>> LogoutAsync(string refreshToken)
        {
            if (string.IsNullOrWhiteSpace(refreshToken))
                return ApiResponse<bool>.Ok(true, "Logged out successfully.");

            var user = await _db.Users.FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);

            if (user == null)
                return ApiResponse<bool>.Ok(true, "Logged out successfully.");

            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "logged out successfully.");
        }

        public async Task<ApiResponse<List<AdminUserDto>>> GetUsersAsync()
        {
            var users = await _db.Users
                .OrderByDescending(u => u.CreatedAt)
                .Select(u => new AdminUserDto
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    IsVerified = u.IsVerified,
                    IsActive = u.IsActive,
                    IsBanned = u.IsBanned,
                    CreatedAt = u.CreatedAt
                })
                .ToListAsync();

            return ApiResponse<List<AdminUserDto>>.Ok(users);
        }

        public async Task<ApiResponse<UserContactDto>> GetUserContactAsync(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                return ApiResponse<UserContactDto>.Fail("User not found.");
            }

            return ApiResponse<UserContactDto>.Ok(new UserContactDto
            {
                Id = user.Id,
                FullName = user.FullName,
                Email = user.Email,
                Role = user.Role.ToString()
            });
        }

        public async Task<ApiResponse<bool>> BanUserAsync(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                return ApiResponse<bool>.Fail("User not found.");
            }

            user.IsBanned = true;
            await _db.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "User has been banned.");
        }

        public async Task<ApiResponse<bool>> UnbanUserAsync(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                return ApiResponse<bool>.Fail("User not found.");
            }

            user.IsBanned = false;
            await _db.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "User has been unbanned.");
        }

        public async Task<ApiResponse<bool>> VerifyUserAsAdminAsync(Guid userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
            {
                return ApiResponse<bool>.Fail("User not found.");
            }

            if (user.IsVerified)
            {
                return ApiResponse<bool>.Fail("User is already verified.");
            }

            user.IsVerified = true;
            await _db.SaveChangesAsync();
            return ApiResponse<bool>.Ok(true, "User has been verified.");
        }
    }
}
