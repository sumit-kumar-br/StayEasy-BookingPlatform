using System.Net;
using System.Text;
using System.Text.Json;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using StayEasy.Booking.Data;
using StayEasy.Booking.DTOs;
using StayEasy.Booking.Models;
using StayEasy.Booking.Services;
using StayEasy.Shared.Enums;

namespace StayEasy.Booking.Tests;

[TestFixture]
public class BookingServiceTests
{
    [Test]
    public async Task ConfirmBookingAsync_CreatesBookingAndReleasesHold_WhenHoldIsValid()
    {
        using var context = CreateDbContext();
        var holdId = Guid.NewGuid();
        var travelerId = Guid.NewGuid();
        var hotelId = Guid.NewGuid();
        var roomTypeId = Guid.NewGuid();

        context.HoldRecords.Add(new HoldRecord
        {
            Id = holdId,
            TravelerId = travelerId,
            HotelId = hotelId,
            RoomTypeId = roomTypeId,
            HotelName = "Grand Palace",
            RoomTypeName = "Deluxe Suite",
            CheckIn = new DateTime(2026, 4, 10),
            CheckOut = new DateTime(2026, 4, 12),
            Guests = 2,
            TotalAmount = 5500m,
            ExpiresAt = DateTime.UtcNow.AddMinutes(10),
            IsReleased = false
        });
        await context.SaveChangesAsync();

        var httpClientFactory = CreateHttpClientFactory(request =>
        {
            if (request.RequestUri?.AbsolutePath.Contains("/api/rooms") == true)
            {
                return CreateJsonResponse(new
                {
                    success = true,
                    message = "Success",
                    data = new[]
                    {
                        new { id = roomTypeId, totalRooms = 5, isActive = true }
                    }
                });
            }

            if (request.RequestUri?.AbsolutePath.Contains("/api/hotels/") == true)
            {
                return new HttpResponseMessage(HttpStatusCode.NotFound);
            }

            return new HttpResponseMessage(HttpStatusCode.NotFound);
        });

        var service = CreateService(context, httpClientFactory);

        var result = await service.ConfirmBookingAsync(new CreateBookingDto
        {
            HoldId = holdId,
            GuestName = "John Doe",
            GuestEmail = "john@example.com",
            SpecialRequests = "Late arrival"
        }, travelerId);

        Assert.That(result.Success, Is.True);
        Assert.That(await context.Bookings.CountAsync(), Is.EqualTo(1));

        var booking = await context.Bookings.SingleAsync();
        var updatedHold = await context.HoldRecords.SingleAsync();

        Assert.That(booking.BookingRef, Is.Not.Empty);
        Assert.That(booking.Status, Is.EqualTo(BookingStatus.Confirmed));
        Assert.That(booking.GuestName, Is.EqualTo("John Doe"));
        Assert.That(booking.GuestEmail, Is.EqualTo("john@example.com"));
        Assert.That(booking.HotelName, Is.EqualTo("Grand Palace"));
        Assert.That(booking.RoomTypeName, Is.EqualTo("Deluxe Suite"));
        Assert.That(updatedHold.IsReleased, Is.True);
        Assert.That(result.Data, Is.Not.Null);
        Assert.That(result.Data!.Status, Is.EqualTo("Confirmed"));
    }

    [Test]
    public async Task ConfirmBookingAsync_FailsAndReleasesHold_WhenHoldExpired()
    {
        using var context = CreateDbContext();
        var holdId = Guid.NewGuid();
        var travelerId = Guid.NewGuid();

        context.HoldRecords.Add(new HoldRecord
        {
            Id = holdId,
            TravelerId = travelerId,
            HotelId = Guid.NewGuid(),
            RoomTypeId = Guid.NewGuid(),
            HotelName = "Grand Palace",
            RoomTypeName = "Deluxe Suite",
            CheckIn = new DateTime(2026, 4, 10),
            CheckOut = new DateTime(2026, 4, 12),
            Guests = 2,
            TotalAmount = 5500m,
            ExpiresAt = DateTime.UtcNow.AddMinutes(-1),
            IsReleased = false
        });
        await context.SaveChangesAsync();

        var service = CreateService(context, CreateHttpClientFactory(_ => new HttpResponseMessage(HttpStatusCode.NotFound)));

        var result = await service.ConfirmBookingAsync(new CreateBookingDto
        {
            HoldId = holdId,
            GuestName = "John Doe",
            GuestEmail = "john@example.com"
        }, travelerId);

        Assert.That(result.Success, Is.False);
        Assert.That(result.Errors, Does.Contain("Hold not found or already released."));

        var hold = await context.HoldRecords.SingleAsync();
        Assert.That(hold.IsReleased, Is.True);
        Assert.That(await context.Bookings.CountAsync(), Is.EqualTo(0));
    }

    private static BookingService CreateService(BookingDbContext db, IHttpClientFactory httpClientFactory)
    {
        var publishEndpoint = new Mock<IPublishEndpoint>(MockBehavior.Loose);
        return new BookingService(db, publishEndpoint.Object, httpClientFactory);
    }

    private static BookingDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<BookingDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var context = new BookingDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }

    private static IHttpClientFactory CreateHttpClientFactory(Func<HttpRequestMessage, HttpResponseMessage> responder)
    {
        var client = new HttpClient(new DelegatingHandlerImpl(responder))
        {
            BaseAddress = new Uri("http://localhost")
        };

        var factory = new Mock<IHttpClientFactory>();
        factory.Setup(x => x.CreateClient(It.IsAny<string>())).Returns(client);
        return factory.Object;
    }

    private static HttpResponseMessage CreateJsonResponse(object payload)
    {
        var json = JsonSerializer.Serialize(payload, new JsonSerializerOptions(JsonSerializerDefaults.Web));
        return new HttpResponseMessage(HttpStatusCode.OK)
        {
            Content = new StringContent(json, Encoding.UTF8, "application/json")
        };
    }

    private sealed class DelegatingHandlerImpl : HttpMessageHandler
    {
        private readonly Func<HttpRequestMessage, HttpResponseMessage> _responder;

        public DelegatingHandlerImpl(Func<HttpRequestMessage, HttpResponseMessage> responder)
        {
            _responder = responder;
        }

        protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
        {
            return Task.FromResult(_responder(request));
        }
    }
}
