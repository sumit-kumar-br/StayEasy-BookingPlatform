namespace StayEasy.Auth.DTOs
{
    public class AdminUserDto
    {
        public Guid Id { get; set; }
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsVerified { get; set; }
        public bool IsActive { get; set; }
        public bool IsBanned { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
