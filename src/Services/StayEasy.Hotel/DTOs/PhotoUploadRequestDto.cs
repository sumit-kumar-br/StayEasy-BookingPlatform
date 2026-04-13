using Microsoft.AspNetCore.Http;

namespace StayEasy.Hotel.DTOs
{
    /// <summary>
    /// Represents request and response contracts for PhotoUploadRequestDto.
    /// </summary>
    public class PhotoUploadRequestDto
    {
        public IFormFile File { get; set; } = default!;
    }
}
