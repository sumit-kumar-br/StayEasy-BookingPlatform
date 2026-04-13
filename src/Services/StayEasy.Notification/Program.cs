using MassTransit;
using Microsoft.EntityFrameworkCore;
using StayEasy.Notification.Abstractions;
using StayEasy.Notification.Consumers;
using StayEasy.Notification.Data;
using StayEasy.Notification.Options;
using StayEasy.Notification.Services;

var builder = WebApplication.CreateBuilder(args);
// Composition root for the Notification service.

builder.Services.Configure<RabbitMqOptions>(builder.Configuration.GetSection("RabbitMq"));
builder.Services.Configure<SmtpOptions>(builder.Configuration.GetSection("Smtp"));

builder.Services.AddDbContext<NotificationDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

builder.Services.AddScoped<IEmailSender, SmtpEmailSender>();
builder.Services.AddScoped<INotificationLogService, NotificationLogService>();

// Messaging pipeline that maps domain events to notification consumers.
builder.Services.AddMassTransit(x =>
{
    x.SetKebabCaseEndpointNameFormatter();

    x.AddConsumer<UserRegisteredConsumer>();
    x.AddConsumer<BookingCreatedConsumer>();
    x.AddConsumer<BookingCancelledConsumer>();
    x.AddConsumer<PaymentSucceededConsumer>();
    x.AddConsumer<ManagerBookingRequestConsumer>();
    x.AddConsumer<ManagerBookingConfirmedConsumer>();
    x.AddConsumer<ManagerBookingCancelledConsumer>();

    x.UsingRabbitMq((context, cfg) =>
    {
        var rabbit = builder.Configuration.GetSection("RabbitMq").Get<RabbitMqOptions>() ?? new RabbitMqOptions();

        cfg.Host(rabbit.Host, rabbit.VirtualHost, h =>
        {
            h.Username(rabbit.Username);
            h.Password(rabbit.Password);
        });

        cfg.UseMessageRetry(r => r.Intervals(1000, 3000, 5000));

        cfg.ReceiveEndpoint("notification.user.registered", e =>
        {
            e.ConfigureConsumer<UserRegisteredConsumer>(context);
        });

        cfg.ReceiveEndpoint("notification.booking.created", e =>
        {
            e.ConfigureConsumer<BookingCreatedConsumer>(context);
        });

        cfg.ReceiveEndpoint("notification.booking.cancelled", e =>
        {
            e.ConfigureConsumer<BookingCancelledConsumer>(context);
        });

        cfg.ReceiveEndpoint("notification.payment.succeeded", e =>
        {
            e.ConfigureConsumer<PaymentSucceededConsumer>(context);
        });

        cfg.ReceiveEndpoint("notification.manager.booking.request", e =>
        {
            e.ConfigureConsumer<ManagerBookingRequestConsumer>(context);
        });

        cfg.ReceiveEndpoint("notification.manager.booking.confirmed", e =>
        {
            e.ConfigureConsumer<ManagerBookingConfirmedConsumer>(context);
        });

        cfg.ReceiveEndpoint("notification.manager.booking.cancelled", e =>
        {
            e.ConfigureConsumer<ManagerBookingCancelledConsumer>(context);
        });
    });
});

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    // Apply pending migrations for notification logs at startup.
    var db = scope.ServiceProvider.GetRequiredService<NotificationDbContext>();
    db.Database.Migrate();
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
// Expose controller endpoints.
app.MapControllers();

app.Run();
