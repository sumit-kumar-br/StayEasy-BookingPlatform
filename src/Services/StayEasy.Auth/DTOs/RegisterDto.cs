using StayEasy.Shared.Enums;

namespace StayEasy.Auth.DTOs
{
    /// <summary>
    /// Represents request and response contracts for RegisterDto.
    /// </summary>
    public class RegisterDto
    {
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string MobileNumber {  get; set; } = string.Empty;
        public UserRole Role { get; set; } = UserRole.Traveller;
    }
}
