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
    public class HotelService: IHotelService
    {
        private readonly HotelDbContext _db;
        private readonly Cloudinary _cloudinary;
        public HotelService(HotelDbContext db, Cloudinary cloudinary)
        {
            _db = db;
            _cloudinary = cloudinary;
        }
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

        public async Task<ApiResponse<HotelResponseDto>> GetHotelByIdAsync(Guid hotelId)
        {
            var hotel = await _db.Hotels.Include(h => h.RoomTypes).FirstOrDefaultAsync(h => h.Id == hotelId);

            if(hotel == null)
            {
                throw new NotFoundException("Hotel", hotelId);
            }

            return ApiResponse<HotelResponseDto>.Ok(MapToDto(hotel));
        }
        public async Task<ApiResponse<List<HotelResponseDto>>> GetMyHotelsAsync(Guid managerId)
        {
            var hotels = await _db.Hotels.Include(h => h.RoomTypes)
                                        .Where(h => h.ManagerId == managerId).ToListAsync();
            return ApiResponse<List<HotelResponseDto>>.Ok(hotels.Select(MapToDto).ToList());

        }
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
                return ApiResponse<bool>.Ok(true, "Photo uploaded successfully.");

            hotel.PhotoUrl = uploadResult.SecureUrl.ToString();
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Fail(uploadResult.Error.Message);
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
