using StayEasy.Shared.Enums;

namespace StayEasy.Auth.Models
{
    /// <summary>
    /// Represents domain data for User.
    /// </summary>
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string MobileNumber {  get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Traveller;
        public bool IsVerified { get; set; } = false;
        public bool IsActive { get; set; } = true;
        public bool IsBanned { get; set; } = false;
        public string? VerificationToken { get; set; }
        public DateTime? VerificationTokenExpiry { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiry {  get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LastLoginAt { get; set; }  
    }
}
