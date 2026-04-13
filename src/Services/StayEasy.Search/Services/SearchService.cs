using Microsoft.EntityFrameworkCore;
using StayEasy.Search.Data;
using StayEasy.Search.DTOs;
using StayEasy.Shared.Common;
using StayEasy.Shared.Exceptions;

namespace StayEasy.Search.Services
{
    /// <summary>
    /// Implements hotel discovery and detail projection for traveler search flows.
    /// </summary>
    public class SearchService: ISearchService
    {
        private readonly SearchDbContext _db;
        public SearchService(SearchDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Searches approved hotels using city, rating, price, and occupancy filters.
        /// </summary>
        public async Task<ApiResponse<List<HotelSearchResultDto>>> SearchHotelsAsync(HotelSearchRequestDto request)
        {
            var query = _db.Hotels.Include(h => h.RoomTypes.Where(r => r.IsActive)).Where(h => h.Status == "Approved");

            // Filter by city
            if(!string.IsNullOrWhiteSpace(request.City))
                query = query.Where(h=>h.City.ToLower().Contains(request.City.ToLower()));

            // Filter by Star rating
            if (request.MinStars.HasValue)
                query = query.Where(h => h.StarRating >= request.MinStars.Value);

            if (request.MaxStars.HasValue)
                query = query.Where(h => h.StarRating <= request.MaxStars.Value);

            // Filter by price 
            if(request.MinPrice.HasValue)
                query = query.Where(h=>h.RoomTypes.Any(r=>r.PricePerNight >= request.MinPrice.Value));
            if (request.MaxPrice.HasValue)
                query = query.Where(h => h.RoomTypes.Any(r => r.PricePerNight <= request.MaxPrice.Value));

            // Filter by max capacity
            query = query.Where(h => h.RoomTypes.Any(r => r.MaxOccupancy >= request.Guests));

            var hotels = await query.ToListAsync();

            var results = hotels.Select(h => new HotelSearchResultDto
            {
                Id = h.Id,
                Name = h.Name,
                Description = h.Description,
                City = h.City,
                Address = h.Address,
                Country = h.Country,
                StarRating = h.StarRating,
                PhotoUrl = h.PhotoUrl,
                LowestPricePerNight = h.RoomTypes.Any() ? h.RoomTypes.Min(r => r.PricePerNight) : 0,
                AvailabilityRoomTypes = h.RoomTypes.Count(r=>r.IsActive)
            }).ToList();

            return ApiResponse<List<HotelSearchResultDto>>.Ok(results);
        }

        /// <summary>
        /// Returns detail data for one hotel in search context.
        /// </summary>
        public async Task<ApiResponse<HotelSearchResultDto>> GetHotelDetailAsync(Guid hotelId)
        {
            var hotel = await _db.Hotels.Include(h => h.RoomTypes.Where(r => r.IsActive))
                                         .FirstOrDefaultAsync(h => h.Id == hotelId);

            if (hotel == null)
                throw new NotFoundException("Hotel", hotelId);

            var result = new HotelSearchResultDto
            {
                Id = hotel.Id,
                Name = hotel.Name,
                Description = hotel.Description,
                City = hotel.City,
                Address = hotel.Address,
                Country = hotel.Country,
                StarRating = hotel.StarRating,
                PhotoUrl = hotel.PhotoUrl,
                LowestPricePerNight = hotel.RoomTypes.Any() ? hotel.RoomTypes.Min(r => r.PricePerNight) : 0,
                AvailabilityRoomTypes = hotel.RoomTypes.Count(r => r.IsActive)
            };
            return ApiResponse<HotelSearchResultDto>.Ok(result);
        }
    }
}
