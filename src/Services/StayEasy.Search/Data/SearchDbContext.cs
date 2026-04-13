using Microsoft.EntityFrameworkCore;
using StayEasy.Search.Models;

namespace StayEasy.Search.Data
{
    /// <summary>
    /// Defines persistence configuration for SearchDbContext.
    /// </summary>
    public class SearchDbContext: DbContext
    {
        public SearchDbContext(DbContextOptions<SearchDbContext> options): base(options) { }
        public DbSet<HotelReadModel> Hotels => Set<HotelReadModel>();
        public DbSet<RoomTypeReadModel> RoomTypes => Set<RoomTypeReadModel>();
    }
}
