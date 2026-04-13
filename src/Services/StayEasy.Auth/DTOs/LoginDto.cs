namespace StayEasy.Auth.DTOs
{
    /// <summary>
    /// Represents request and response contracts for LoginDto.
    /// </summary>
    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }
}
