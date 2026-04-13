using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StayEasy.Notification.Data;

namespace StayEasy.Notification.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    /// <summary>
    /// Handles HTTP endpoints for NotificationsController.
    /// </summary>
    public class NotificationsController : ControllerBase
    {
        private readonly NotificationDbContext _db;

        public NotificationsController(NotificationDbContext db)
        {
            _db = db;
        }

        [HttpGet("health")]
        /// <summary>
        /// Executes Health business operation.
        /// </summary>
        public IActionResult Health()
        {
            return Ok(new { ok = true, service = "notification" });
        }

        [HttpGet("logs")]
        /// <summary>
        /// Executes Logs business operation.
        /// </summary>
        public async Task<IActionResult> Logs([FromQuery] int take = 50)
        {
            take = Math.Clamp(take, 1, 200);

            var data = await _db.NotificationLogs
                .OrderByDescending(x => x.CreatedAtUtc)
                .Take(take)
                .Select(x => new
                {
                    x.Id,
                    x.EventId,
                    x.EventType,
                    x.UserId,
                    x.Email,
                    x.Subject,
                    x.Channel,
                    x.Status,
                    x.AttemptCount,
                    x.ErrorMessage,
                    x.CreatedAtUtc,
                    x.SentAtUtc
                })
                .ToListAsync();

            return Ok(data);
        }
    }
}
