using System.Globalization;
using System.Net.Http.Headers;
using System.Security.Cryptography;
using System.Text;
using System.Text.Json;
using MassTransit;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using StayEasy.Payment.Data;
using StayEasy.Payment.DTOs;
using StayEasy.Payment.Models;
using StayEasy.Payment.Options;
using StayEasy.Shared.Common;
using StayEasy.Shared.Contracts.Notifications;

namespace StayEasy.Payment.Services
{
    /// <summary>
    /// Integrates payment-provider order creation and payment verification for bookings.
    /// </summary>
    public class PaymentService : IPaymentService
    {
        private readonly PaymentDbContext _db;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly RazorpayOptions _razorpay;
        private readonly IPublishEndpoint _publishEndpoint;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            PaymentDbContext db,
            IHttpClientFactory httpClientFactory,
            IOptions<RazorpayOptions> razorpay,
            IPublishEndpoint publishEndpoint,
            ILogger<PaymentService> logger)
        {
            _db = db;
            _httpClientFactory = httpClientFactory;
            _razorpay = razorpay.Value;
            _publishEndpoint = publishEndpoint;
            _logger = logger;
        }

        /// <summary>
        /// Creates a payment order with the configured provider and stores a pending transaction.
        /// </summary>
        public async Task<ApiResponse<CreateOrderResponseDto>> CreateOrderAsync(CreateOrderRequestDto dto, Guid userId)
        {
            if (dto.Amount <= 0)
            {
                return ApiResponse<CreateOrderResponseDto>.Fail("Amount must be greater than zero.");
            }

            var client = _httpClientFactory.CreateClient();
            client.BaseAddress = new Uri("https://api.razorpay.com/");

            var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_razorpay.KeyId}:{_razorpay.KeySecret}"));
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", authToken);

            var amountInPaise = Convert.ToInt64(Math.Round(dto.Amount * 100M, MidpointRounding.AwayFromZero));
            var receipt = $"book_{dto.BookingId:N}";

            var payload = new
            {
                amount = amountInPaise,
                currency = _razorpay.Currency,
                receipt,
                payment_capture = 1
            };

            var response = await client.PostAsJsonAsync("v1/orders", payload);
            if (!response.IsSuccessStatusCode)
            {
                var error = await response.Content.ReadAsStringAsync();
                _logger.LogError("Failed creating Razorpay order: {Error}", error);
                return ApiResponse<CreateOrderResponseDto>.Fail("Unable to create payment order.");
            }

            var content = await response.Content.ReadAsStringAsync();
            using var json = JsonDocument.Parse(content);
            var providerOrderId = json.RootElement.GetProperty("id").GetString();

            if (string.IsNullOrWhiteSpace(providerOrderId))
            {
                return ApiResponse<CreateOrderResponseDto>.Fail("Invalid response from payment provider.");
            }

            var txn = new PaymentTransaction
            {
                BookingId = dto.BookingId,
                UserId = userId,
                Email = dto.Email,
                Amount = dto.Amount,
                Currency = _razorpay.Currency,
                ProviderOrderId = providerOrderId,
                Status = PaymentStatus.Pending,
                UpdatedAtUtc = DateTime.UtcNow
            };

            _db.PaymentTransactions.Add(txn);
            await _db.SaveChangesAsync();

            return ApiResponse<CreateOrderResponseDto>.Ok(new CreateOrderResponseDto
            {
                TransactionId = txn.Id,
                BookingId = txn.BookingId,
                ProviderOrderId = providerOrderId,
                KeyId = _razorpay.KeyId,
                Amount = txn.Amount,
                Currency = txn.Currency
            });
        }

        /// <summary>
        /// Verifies provider signature, updates transaction status, and publishes success events.
        /// </summary>
        public async Task<ApiResponse<bool>> VerifyPaymentAsync(VerifyPaymentRequestDto dto, Guid userId)
        {
            var txn = await _db.PaymentTransactions
                .FirstOrDefaultAsync(x => x.BookingId == dto.BookingId && x.UserId == userId);

            if (txn == null)
            {
                return ApiResponse<bool>.Fail("Payment transaction not found.");
            }

            if (!string.Equals(txn.ProviderOrderId, dto.RazorpayOrderId, StringComparison.Ordinal))
            {
                return ApiResponse<bool>.Fail("Order id mismatch.");
            }

            if (txn.Status == PaymentStatus.Succeeded)
            {
                return ApiResponse<bool>.Ok(true, "Payment already verified.");
            }

            var isSignatureValid = VerifyRazorpaySignature(dto.RazorpayOrderId, dto.RazorpayPaymentId, dto.RazorpaySignature);

            if (!isSignatureValid)
            {
                txn.Status = PaymentStatus.Failed;
                txn.FailureReason = "Signature verification failed.";
                txn.UpdatedAtUtc = DateTime.UtcNow;
                await _db.SaveChangesAsync();
                return ApiResponse<bool>.Fail("Invalid payment signature.");
            }

            txn.ProviderPaymentId = dto.RazorpayPaymentId;
            txn.RazorpaySignature = dto.RazorpaySignature;
            txn.Status = PaymentStatus.Succeeded;
            txn.FailureReason = null;
            txn.UpdatedAtUtc = DateTime.UtcNow;
            await _db.SaveChangesAsync();

            await PublishPaymentSucceededAsync(txn, dto.RazorpayPaymentId);

            return ApiResponse<bool>.Ok(true, "Payment verified successfully.");
        }

        /// <summary>
        /// Returns the stored payment status for a booking.
        /// </summary>
        public async Task<ApiResponse<PaymentStatusResponseDto>> GetPaymentStatusAsync(Guid bookingId, Guid userId)
        {
            var txn = await _db.PaymentTransactions
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.BookingId == bookingId && x.UserId == userId);

            if (txn == null)
            {
                return ApiResponse<PaymentStatusResponseDto>.Fail("Payment record not found.");
            }

            return ApiResponse<PaymentStatusResponseDto>.Ok(new PaymentStatusResponseDto
            {
                BookingId = txn.BookingId,
                Status = txn.Status.ToString(),
                ProviderOrderId = txn.ProviderOrderId,
                ProviderPaymentId = txn.ProviderPaymentId,
                Amount = txn.Amount,
                Currency = txn.Currency,
                FailureReason = txn.FailureReason,
                UpdatedAtUtc = txn.UpdatedAtUtc
            });
        }

        private bool VerifyRazorpaySignature(string orderId, string paymentId, string signature)
        {
            var payload = $"{orderId}|{paymentId}";
            var expectedSignature = ComputeHmacSha256(payload, _razorpay.KeySecret);
            return string.Equals(expectedSignature, signature, StringComparison.OrdinalIgnoreCase);
        }

        private static string ComputeHmacSha256(string payload, string secret)
        {
            var keyBytes = Encoding.UTF8.GetBytes(secret);
            var payloadBytes = Encoding.UTF8.GetBytes(payload);

            using var hmac = new HMACSHA256(keyBytes);
            var hash = hmac.ComputeHash(payloadBytes);
            return Convert.ToHexString(hash).ToLower(CultureInfo.InvariantCulture);
        }

        private async Task PublishPaymentSucceededAsync(PaymentTransaction txn, string paymentReference)
        {
            await _publishEndpoint.Publish(new PaymentSucceededEvent
            {
                EventId = Guid.NewGuid(),
                OccurredAtUtc = DateTime.UtcNow,
                CorrelationId = txn.BookingId.ToString("N"),
                BookingId = txn.BookingId,
                UserId = txn.UserId,
                Email = txn.Email,
                Amount = txn.Amount,
                Currency = txn.Currency,
                PaymentReference = paymentReference
            });
        }
    }
}
