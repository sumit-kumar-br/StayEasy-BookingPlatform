using System.Text.Json.Serialization;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using StayEasy.Payment.Data;
using StayEasy.Payment.Options;
using StayEasy.Payment.Services;
using StayEasy.Shared.JWT;

var builder = WebApplication.CreateBuilder(args);
// Composition root for the Payment service.

const string FrontendCorsPolicy = "FrontendCorsPolicy";

var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>()!;
builder.Services.AddSingleton(jwtSettings);

builder.Services.Configure<RazorpayOptions>(builder.Configuration.GetSection("Razorpay"));

builder.Services.AddDbContext<PaymentDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddHttpClient();
builder.Services.AddScoped<IPaymentService, PaymentService>();

// Messaging pipeline used to publish payment outcome events.
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

builder.Services.AddJwtAuthentication(jwtSettings);
builder.Services.AddAuthorization();

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(options =>
{
    options.CustomSchemaIds(type => type.FullName);
    options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter: Bearer {your token}"
    });
    options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    // Ensure payment schema exists for local/dev bootstrap.
    var db = scope.ServiceProvider.GetRequiredService<PaymentDbContext>();
    db.Database.EnsureCreated();
}

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
