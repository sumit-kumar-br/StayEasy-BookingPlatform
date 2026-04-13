using Microsoft.EntityFrameworkCore;
using MassTransit;
using StayEasy.Auth.Data;
using StayEasy.Auth.Services;
using StayEasy.Shared.Exceptions;
using StayEasy.Shared.JWT;
using System.Text.Json.Serialization;


var builder = WebApplication.CreateBuilder(args);
// Composition root for the Auth service.

const string FrontendCorsPolicy = "FrontendCorsPolicy";

// JWT Settings
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;
builder.Services.AddSingleton(jwtSettings);
builder.Services.AddSingleton<JwtTokenGenerator>();

// Database 
builder.Services.AddDbContext<AuthDbContext>(options => 
            options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Services
builder.Services.AddScoped<IAuthService, AuthService>();

// Messaging pipeline for cross-service events (registration notifications, etc.).
builder.Services.AddMassTransit(x =>
{
    x.UsingRabbitMq((_, cfg) =>
    {
        var rabbitHost = builder.Configuration["RabbitMq:Host"] ?? "localhost";
        var rabbitVHost = builder.Configuration["RabbitMq:VirtualHost"] ?? "/";
        var rabbitUser = builder.Configuration["RabbitMq:Username"] ?? "guest";
        var rabbitPass = builder.Configuration["RabbitMq:Password"] ?? "guest";

        cfg.Host(rabbitHost, rabbitVHost, h =>
        {
            h.Username(rabbitUser);
            h.Password(rabbitPass);
        });
    });
});

builder.Services.AddCors(options =>
{
    options.AddPolicy(FrontendCorsPolicy, policy =>
    {
        policy
            .WithOrigins("http://localhost:4200", "https://localhost:4200")
            .AllowAnyHeader()
            .AllowAnyMethod();
    });
});

// Auth
builder.Services.AddJwtAuthentication(jwtSettings);
builder.Services.AddAuthorization();

builder.Services.AddControllers();
// For add roles in string instead of numbers
builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

//builder.Services.AddSwaggerGen(options =>
//{
//    options.UseInlineDefinitionsForEnums();
//});

var app = builder.Build();

// Middleware
app.UseMiddleware<GlobalExceptionMiddleware>();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors(FrontendCorsPolicy);
app.UseAuthentication();
app.UseAuthorization();
// Expose controller endpoints.
app.MapControllers();

app.Run();
