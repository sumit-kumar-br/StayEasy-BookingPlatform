using Microsoft.EntityFrameworkCore.Storage.ValueConversion.Internal;

namespace StayEasy.Auth.DTOs
{
    /// <summary>
    /// Represents request and response contracts for AuthResponseDto.
    /// </summary>
    public class AuthResponseDto
    {
        public Guid UserId { get; set; }
        public string FullName {  get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role {  get; set; } = string.Empty;
        public string AccessToken { get; set; } = string.Empty;
        public string ReferenceToken { get; set; } = string.Empty;

    }
}
