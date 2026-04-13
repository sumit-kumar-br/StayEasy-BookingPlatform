using Microsoft.EntityFrameworkCore;
using StayEasy.Notification.Models;

namespace StayEasy.Notification.Data
{
    /// <summary>
    /// Defines persistence configuration for NotificationDbContext.
    /// </summary>
    public class NotificationDbContext : DbContext
    {
        public NotificationDbContext(DbContextOptions<NotificationDbContext> options) : base(options)
        {
        }

        public DbSet<NotificationLog> NotificationLogs => Set<NotificationLog>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            var log = modelBuilder.Entity<NotificationLog>();

            log.HasKey(x => x.Id);

            log.Property(x => x.EventType).HasMaxLength(200).IsRequired();
            log.Property(x => x.Email).HasMaxLength(256).IsRequired();
            log.Property(x => x.Subject).HasMaxLength(300).IsRequired();
            log.Property(x => x.ErrorMessage).HasMaxLength(2000);

            log.HasIndex(x => new { x.EventId, x.Channel }).IsUnique();

            base.OnModelCreating(modelBuilder);
        }
    }
}
