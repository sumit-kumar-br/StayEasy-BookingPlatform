namespace StayEasy.Auth.DTOs
{
    /// <summary>
    /// Represents request and response contracts for TokenRequestDto.
    /// </summary>
    public class TokenRequestDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}
