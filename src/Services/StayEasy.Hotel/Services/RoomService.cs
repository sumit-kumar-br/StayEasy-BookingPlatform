using Microsoft.EntityFrameworkCore;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using StayEasy.Hotel.Data;
using StayEasy.Hotel.DTOs;
using StayEasy.Hotel.Models;
using StayEasy.Shared.Common;
using StayEasy.Shared.Exceptions;

namespace StayEasy.Hotel.Services
{
    public class RoomService: IRoomService
    {
        private readonly HotelDbContext _db;
        private readonly Cloudinary _cloudinary;

        public RoomService(HotelDbContext db, Cloudinary cloudinary)
        {
            _db = db;
            _cloudinary = cloudinary;
        }
        public async Task<ApiResponse<RoomTypeResponseDto>> CreateRoomTypeAsync(Guid hotelId, CreateRoomTypeDto dto, Guid managerId)
        {
            var hotel = await _db.Hotels.FirstOrDefaultAsync(h => h.Id == hotelId && h.ManagerId == managerId);

            if(hotel == null)
                throw new NotFoundException("Hotel", hotelId);

            var roomType = new RoomType
            {
                HotelId = hotelId,
                Name = dto.Name,
                Description = dto.Description,
                MaxOccupancy = dto.MaxOccupancy,
                PricePerNight = dto.PricePerNight,
                TotalRooms = dto.TotalRooms,
                BedConfiguration = dto.BedConfiguration,
            };

            _db.RoomTypes.Add(roomType);
            await _db.SaveChangesAsync();

            return ApiResponse<RoomTypeResponseDto>.Ok(MapToDto(roomType));
        }
        public async Task<ApiResponse<List<RoomTypeResponseDto>>> GetRoomTypesAsync(Guid hotelId)
        {
            var rooms = await _db.RoomTypes.Where(r => r.HotelId == hotelId && r.IsActive).ToListAsync();

            return ApiResponse<List<RoomTypeResponseDto>>.Ok(rooms.Select(MapToDto).ToList());
        }
        public async Task<ApiResponse<bool>> DeleteRoomTypeAsync(Guid roomTypeId, Guid managerId)
        {
            var room = await _db.RoomTypes.Include(r => r.Hotel)
                        .FirstOrDefaultAsync(r => r.Id == roomTypeId && r.Hotel.ManagerId == managerId);

            if (room == null)
                throw new NotFoundException("RoomType", roomTypeId);

            room.IsActive = false;
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Room type deleted.");
        }

        public async Task<ApiResponse<bool>> UploadPhotoAsync(Guid roomTypeId, IFormFile photo, Guid managerId)
        {
            var room = await _db.RoomTypes
                .Include(r => r.Hotel)
                .FirstOrDefaultAsync(r => r.Id == roomTypeId && r.Hotel.ManagerId == managerId && r.IsActive);

            if (room == null)
                throw new NotFoundException("RoomType", roomTypeId);

            using var stream = photo.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(photo.FileName, stream),
                Folder = $"stayeasy/rooms/{room.HotelId}"
            };

            var uploadResult = await _cloudinary.UploadAsync(uploadParams);
            if (uploadResult.Error != null)
                return ApiResponse<bool>.Fail(uploadResult.Error.Message);

            room.PhotoUrl = uploadResult.SecureUrl.ToString();
            await _db.SaveChangesAsync();

            return ApiResponse<bool>.Ok(true, "Room photo uploaded successfully.");
        }

        private static RoomTypeResponseDto MapToDto(RoomType r) => new()
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
            IsActive = r.IsActive,
        };
    }
}
