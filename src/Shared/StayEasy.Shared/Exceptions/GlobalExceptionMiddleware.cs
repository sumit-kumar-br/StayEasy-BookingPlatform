using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Http;
using StayEasy.Shared.Common;

namespace StayEasy.Shared.Exceptions
{
    /// <summary>
    /// Defines GlobalExceptionMiddleware.
    /// </summary>
    public class GlobalExceptionMiddleware
    {
        private readonly RequestDelegate _next;

        public GlobalExceptionMiddleware(RequestDelegate next)
        {
            _next = next;
        }
        /// <summary>
        /// Executes InvokeAsync operation.
        /// </summary>
        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch(NotFoundException ex)
            {
                await WriteResponse(context, HttpStatusCode.NotFound, ex.Message);
            }
        }
        private static async Task WriteResponse(HttpContext context, HttpStatusCode statusCode, string message)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = (int)statusCode;

            var response = ApiResponse<object>.Fail(message);
            var json = JsonSerializer.Serialize(response, new JsonSerializerOptions
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            });

            await context.Response.WriteAsync(json);
        }
    }
}
