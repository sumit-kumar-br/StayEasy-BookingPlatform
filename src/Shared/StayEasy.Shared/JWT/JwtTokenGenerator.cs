using StayEasy.Shared.Enums;
using System.Text;
using System.Security.Claims;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;


namespace StayEasy.Shared.JWT
{
    /// <summary>
    /// Generates JWT access tokens from configured issuer and signing settings.
    /// </summary>
    public class JwtTokenGenerator
    {
        private readonly JwtSettings _settings;

        /// <summary>
        /// Creates a token generator for the provided JWT settings.
        /// </summary>
        public JwtTokenGenerator(JwtSettings settings)
        {
            _settings = settings;
        }

        /// <summary>
        /// Generates a signed JWT for the specified user and role.
        /// </summary>
        public string GenerateToken(Guid userId, string email, UserRole role)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId.ToString()),
                new Claim(ClaimTypes.Email, email),
                new Claim(ClaimTypes.Role, role.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Key));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _settings.Issuer,
                audience: _settings.Issuer,
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_settings.ExpiryMinutes),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}
