using System.IdentityModel.Tokens.Jwt;
using System.Net;
using System.Security.Claims;
using System.Text;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Moq;
using NUnit.Framework;
using StayEasy.Auth.Data;
using StayEasy.Auth.DTOs;
using StayEasy.Auth.Models;
using StayEasy.Auth.Services;
using StayEasy.Shared.Contracts.Notifications;
using StayEasy.Shared.Enums;
using StayEasy.Shared.JWT;

namespace StayEasy.Auth.Tests;

[TestFixture]
public class AuthServiceTests
{
    [Test]
    public async Task RegisterAsync_CreatesUser_WithRequestedRole_AndPublishesEvent()
    {
        using var context = CreateDbContext();
        var publishEndpoint = new Mock<IPublishEndpoint>(MockBehavior.Strict);
        publishEndpoint
            .Setup(x => x.Publish(It.IsAny<UserRegisteredEvent>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask)
            .Verifiable();

        var service = CreateService(context, publishEndpoint.Object);

        var result = await service.RegisterAsync(new RegisterDto
        {
            FullName = "Hotel Owner",
            Email = "owner@example.com",
            Password = "P@ssword123",
            MobileNumber = "9999999999",
            Role = UserRole.HotelManager
        });

        Assert.That(result.Success, Is.True);
        Assert.That(result.Data, Is.Not.Null);
        Assert.That(result.Data!.Email, Is.EqualTo("owner@example.com"));
        Assert.That(result.Data.Role, Is.EqualTo(UserRole.HotelManager.ToString()));

        var user = await context.Users.SingleAsync();
        Assert.That(user.Role, Is.EqualTo(UserRole.HotelManager));
        Assert.That(user.Email, Is.EqualTo("owner@example.com"));
        Assert.That(BCrypt.Net.BCrypt.Verify("P@ssword123", user.PasswordHash), Is.True);
        Assert.That(user.IsVerified, Is.False);
        Assert.That(user.VerificationToken, Is.Not.Null.And.Not.Empty);

        publishEndpoint.Verify(x => x.Publish(It.IsAny<UserRegisteredEvent>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Test]
    public async Task LoginAsync_ReturnsTokens_AndJwtContainsRoleClaim()
    {
        using var context = CreateDbContext();
        var user = new User
        {
            FullName = "Traveler One",
            Email = "traveler@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("P@ssword123"),
            MobileNumber = "8888888888",
            Role = UserRole.Traveller,
            IsVerified = true
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var service = CreateService(context, new Mock<IPublishEndpoint>().Object);

        var result = await service.LoginAsync(new LoginDto
        {
            Email = "traveler@example.com",
            Password = "P@ssword123"
        });

        Assert.That(result.Success, Is.True);
        Assert.That(result.Data, Is.Not.Null);
        Assert.That(result.Data!.Role, Is.EqualTo(UserRole.Traveller.ToString()));
        Assert.That(result.Data.AccessToken, Is.Not.Empty);
        Assert.That(result.Data.ReferenceToken, Is.Not.Empty);

        var token = new JwtSecurityTokenHandler().ReadJwtToken(result.Data.AccessToken);
        Assert.That(token.Claims.First(c => c.Type == ClaimTypes.Role).Value, Is.EqualTo(UserRole.Traveller.ToString()));
        Assert.That(token.Claims.First(c => c.Type == ClaimTypes.Email).Value, Is.EqualTo("traveler@example.com"));

        var saved = await context.Users.SingleAsync();
        Assert.That(saved.RefreshToken, Is.EqualTo(result.Data.ReferenceToken));
        Assert.That(saved.LastLoginAt, Is.Not.Null);
    }

    [Test]
    public async Task VerifyEmailAsync_MarksUserVerified_AndClearsToken()
    {
        using var context = CreateDbContext();
        var user = new User
        {
            FullName = "Pending User",
            Email = "pending@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("P@ssword123"),
            MobileNumber = "7777777777",
            Role = UserRole.Traveller,
            VerificationToken = "verify-token",
            VerificationTokenExpiry = DateTime.UtcNow.AddHours(1)
        };
        context.Users.Add(user);
        await context.SaveChangesAsync();

        var service = CreateService(context, new Mock<IPublishEndpoint>().Object);

        var result = await service.VerifyEmailAsync("verify-token");

        Assert.That(result.Success, Is.True);
        Assert.That(result.Data, Is.True);

        var saved = await context.Users.SingleAsync();
        Assert.That(saved.IsVerified, Is.True);
        Assert.That(saved.VerificationToken, Is.Null);
        Assert.That(saved.VerificationTokenExpiry, Is.Null);
    }

    [Test]
    public async Task LoginAsync_Fails_WhenUserIsNotVerified()
    {
        using var context = CreateDbContext();
        context.Users.Add(new User
        {
            FullName = "Unverified User",
            Email = "unverified@example.com",
            PasswordHash = BCrypt.Net.BCrypt.HashPassword("P@ssword123"),
            MobileNumber = "6666666666",
            Role = UserRole.Traveller,
            IsVerified = false
        });
        await context.SaveChangesAsync();

        var service = CreateService(context, new Mock<IPublishEndpoint>().Object);

        var result = await service.LoginAsync(new LoginDto
        {
            Email = "unverified@example.com",
            Password = "P@ssword123"
        });

        Assert.That(result.Success, Is.False);
        Assert.That(result.Errors, Does.Contain("Please verify your email before logging in."));
    }

    private static AuthService CreateService(AuthDbContext context, IPublishEndpoint publishEndpoint)
    {
        var jwtSettings = new JwtSettings
        {
            Key = "StayEasy@2026#Jwt$Secret!mK9pL2vN8qR4xW",
            Issuer = "StayEasy",
            ExpiryMinutes = 15,
            RefreshTokenExpiryDays = 7
        };

        var jwtGenerator = new JwtTokenGenerator(jwtSettings);
        return new AuthService(context, jwtGenerator, jwtSettings, publishEndpoint);
    }

    private static AuthDbContext CreateDbContext()
    {
        var options = new DbContextOptionsBuilder<AuthDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;

        var context = new AuthDbContext(options);
        context.Database.EnsureCreated();
        return context;
    }
}
