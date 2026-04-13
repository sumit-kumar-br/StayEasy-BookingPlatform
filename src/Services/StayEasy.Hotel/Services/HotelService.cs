using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using FluentValidation.Validators;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using StayEasy.Hotel.Data;
using StayEasy.Hotel.DTOs;
using StayEasy.Hotel.Models;
using StayEasy.Shared.Common;
using StayEasy.Shared.Enums;
using StayEasy.Shared.Exceptions;
using System.Linq.Expressions;
using HotelModel = StayEasy.Hotel.Models.Hotel;

namespace StayEasy.Hotel.Services
{
    /// <summary>
    /// Implements hotel listing operations for managers and admins.
    /// </summary>
    public class HotelService: IHotelService
    {
        private readonly HotelDbContext _db;
        private readonly Cloudinary _cloudinary;
        public HotelService(HotelDbContext db, Cloudinary cloudinary)
        {
            _db = db;
            _cloudinary = cloudinary;
        }

        /// <summary>
        /// Creates a new hotel listing in pending-review state.
        /// </summary>
        public async Task<ApiResponse<HotelResponseDto>> CreateHotelAsync(CreateHotelDto dto, Guid managerId)
        {
            var hotel = new HotelModel
            {
                ManagerId = managerId,
                Name = dto.Name,
                Description = dto.Description,
                City = dto.City,
                Address = dto.Address,
                Country = dto.Country,
                StarRating = dto.StarRating,
                Lattitude = dto.Lattitude,
                Longitude = dto.Longitude,
                Status = PropertyStatus.PendingReview
            };
            _db.Hotels.Add(hotel);
            await _db.SaveChangesAsync();

            return ApiResponse<HotelResponseDto>.Ok(MapToDto(hotel));
        }

        /// <summary>
        /// Fetches a hotel with room-type details.
        /// </summary>
        public async Task<ApiResponse<HotelResponseDto>> GetHotelByIdAsync(Guid hotelId)
        {
            var hotel = await _db.Hotels.Include(h => h.RoomTypes).FirstOrDefaultAsync(h => h.Id == hotelId);

            if(hotel == null)
            {
                throw new NotFoundException("Hotel", hotelId);
            }

            return ApiResponse<HotelResponseDto>.Ok(MapToDto(hotel));
        }

        /// <summary>
        /// Lists hotels owned by the requesting manager.
        /// </summary>
        public async Task<ApiResponse<List<HotelResponseDto>>> GetMyHotelsAsync(Guid managerId)
        {
            var hotels = await _db.Hotels.Include(h => h.RoomTypes)
                                        .Where(h => h.ManagerId == managerId).ToListAsync();
            return ApiResponse<List<HotelResponseDto>>.Ok(hotels.Select(MapToDto).ToList());

        }

        /// <summary>
        /// Lists all hotels with latest first ordering.
        /// </summary>
        public async Task<ApiResponse<List<HotelResponseDto>>> GetAllHotelsAsync()
        {
            var hotels = await _db.Hotels
                .Include(h => h.RoomTypes)
                .OrderByDescending(h => h.CreatedAt)
                .ToListAsync();

            return ApiResponse<List<HotelResponseDto>>.Ok(hotels.Select(MapToDto).ToList());
        }

        /// <summary>
        /// Updates manager-owned hotel profile fields.
        /// </summary>
        public async Task<ApiResponse<HotelResponseDto>> UpdateHotelAsync(Guid hotelId, UpdateHotelDto dto, Guid managerId)
        {
            var hotel = await _db.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId && h.ManagerId == managerId);

            if(hotel == null)
            {
                throw new NotFoundException("Hotel", hotelId);
            }
            hotel.Name = dto.Name;
            hotel.Description = dto.Description;
            hotel.Address = dto.Address;
            hotel.StarRating = dto.StarRating;

            await _db.SaveChangesAsync();

            return ApiResponse<HotelResponseDto>.Ok(MapToDto(hotel));
        }

        /// <summary>
        /// Marks a hotel listing as approved.
        /// </summary>
        public async Task<ApiResponse<bool>> ApproveHotelAsync(Guid hotelId)
        {
            var hotel = await _db.Hotels.FindAsync(hotelId);
            if(hotel == null)
            {
                throw new NotFoundException("Hotel", hotelId);
            }
            hotel.Status = PropertyStatus.Approved;
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Hotel Approved successfully.");
        }

        /// <summary>
        /// Marks a hotel listing as rejected/suspended.
        /// </summary>
        public async Task<ApiResponse<bool>> RejectHotelAsync(Guid hotelId)
        {
            var hotel = await _db.Hotels.FindAsync(hotelId);

            if(hotel == null)
            {
                throw new NotFoundException("Hotel", hotelId);
            }

            hotel.Status = PropertyStatus.Suspended;
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Hotel rejected.");
        }

        /// <summary>
        /// Uploads and stores a hotel cover photo in Cloudinary.
        /// </summary>
        public async Task<ApiResponse<bool>> UploadPhotoAsync(Guid hotelId, IFormFile photo, Guid managerId)
        {
            var hotel = await _db.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId && h.ManagerId == managerId);
            if(hotel == null)
            {
                throw new NotFoundException("Hotel", hotelId);
            }
            using var stream = photo.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(photo.FileName, stream),
                Folder = $"stayeasy/hotels/{hotelId}"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);

            if (uploadResult.Error != null)
                return ApiResponse<bool>.Fail(uploadResult.Error.Message);

            hotel.PhotoUrl = uploadResult.SecureUrl.ToString();
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Photo upload successfully.");
        }
        private static HotelResponseDto MapToDto(HotelModel hotel) => new()
        {
            Id = hotel.Id,
            ManagerId = hotel.ManagerId,
            Name = hotel.Name,
            Description = hotel.Description,
            City = hotel.City,
            Address = hotel.Address,
            Country = hotel.Country,
            StarRating = hotel.StarRating,
            Status = hotel.Status.ToString(),
            PhotoUrl = hotel.PhotoUrl,
            RoomTypes = hotel.RoomTypes.Select(r=>new RoomTypeResponseDto
            {
                Id = r.Id,
                HotelId = r.HotelId,
                Name = r.Name,
                Description = r.Description,
                MaxOccupancy = r.MaxOccupancy,
                PricePerNight = r.PricePerNight,
                TotalRooms = r.TotalRooms,
                BedConfiguration = r.BedConfiguration,
                PhotoUrl = r.PhotoUrl,
                IsActive = r.IsActive
            }).ToList()
        };

    }
}
