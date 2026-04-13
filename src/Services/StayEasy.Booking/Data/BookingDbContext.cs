using Microsoft.EntityFrameworkCore;
using StayEasy.Booking.Models;
using BookingModel = StayEasy.Booking.Models.Booking;

namespace StayEasy.Booking.Data
{
    /// <summary>
    /// Defines persistence configuration for BookingDbContext.
    /// </summary>
    public class BookingDbContext: DbContext
    {
        public BookingDbContext(DbContextOptions<BookingDbContext> options): base(options) { }

        public DbSet<BookingModel> Bookings => Set<BookingModel>();
        public DbSet<HoldRecord> HoldRecords => Set<HoldRecord>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<BookingModel>(entity =>
            {
                entity.HasKey(b => b.Id);
                entity.HasIndex(b => b.BookingRef).IsUnique();
                entity.Property(b => b.TotalAmount).HasColumnType("decimal(18,2)");
                entity.Property(b => b.Status).HasConversion<string>();
            });
            modelBuilder.Entity<HoldRecord>(entity =>
            {
                entity.HasKey(h => h.Id);
                entity.Property(h => h.TotalAmount).HasColumnType("decimal(18,2)");
            });
        }
    }
}
