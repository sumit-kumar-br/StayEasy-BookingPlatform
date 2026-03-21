using Microsoft.EntityFrameworkCore;
using StayEasy.Auth.Models;

namespace StayEasy.Auth.Data
{
    public class AuthDbContext: DbContext
    {
        public AuthDbContext(DbContextOptions<AuthDbContext> options): base(options) { }
        public DbSet<User> Users { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(u => u.Id);
                entity.HasIndex(u => u.Email);
                entity.Property(u => u.Email).IsRequired().HasMaxLength(256);
                entity.Property(u => u.FullName).IsRequired().HasMaxLength(100);
                entity.Property(u => u.MobileNumber).HasMaxLength(20);
                entity.Property(u => u.Role).HasConversion<string>();
            });
        }
    }
}
