namespace StayEasy.Shared.JWT
{
    /// <summary>
    /// Defines JwtSettings.
    /// </summary>
    public class JwtSettings
    {
        public string Key { get; set; } = string.Empty;
        public string Issuer { get; set; } = string.Empty;
        public int ExpiryMinutes { get; set; } = 15;
        public int RefreshTokenExpiryDays { get; set; } = 7;
    }
}
