using Microsoft.EntityFrameworkCore;
using StayEasy.Hotel.Models;
using HotelModel = StayEasy.Hotel.Models.Hotel;

namespace StayEasy.Hotel.Data
{
    public class HotelDbContext: DbContext
    {
        public HotelDbContext(DbContextOptions<HotelDbContext> options): base(options) { }
        public DbSet<HotelModel> Hotels => Set<HotelModel>();
        public DbSet<RoomType> RoomTypes => Set<RoomType>();
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<HotelModel>(entity =>
            {
                entity.HasKey(h => h.Id);
                entity.Property(h => h.Name).IsRequired().HasMaxLength(200);
                entity.Property(h => h.City).IsRequired().HasMaxLength(100);
                entity.Property(h => h.Country).IsRequired().HasMaxLength(100);
                entity.Property(h => h.Status).HasConversion<string>();
                entity.HasMany(h => h.RoomTypes)
                        .WithOne(r => r.Hotel)
                        .HasForeignKey(r => r.HotelId)
                        .OnDelete(DeleteBehavior.Cascade);
            });

            modelBuilder.Entity<RoomType>(entity =>
            {
                entity.HasKey(r => r.Id);
                entity.Property(r => r.Name).IsRequired().HasMaxLength(100);
                entity.Property(r => r.PricePerNight).HasColumnType("decimal(18,2)");
            });
        }
    }
}
