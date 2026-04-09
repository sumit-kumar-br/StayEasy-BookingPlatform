using Microsoft.AspNetCore.Http;

namespace StayEasy.Hotel.DTOs
{
    public class PhotoUploadRequestDto
    {
        public IFormFile File { get; set; } = default!;
    }
}
