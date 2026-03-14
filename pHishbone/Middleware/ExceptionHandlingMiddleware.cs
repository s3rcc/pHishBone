using Domain.Exceptions;
using System.Text.Json;

namespace pHishbone.Middleware
{
    public class ExceptionHandlingMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;
        private readonly IWebHostEnvironment _env;

        public ExceptionHandlingMiddleware(RequestDelegate next, ILogger<ExceptionHandlingMiddleware> logger, IWebHostEnvironment env)
        {
            _next = next;
            _logger = logger;
            _env = env;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (CustomErrorException ex)
            {
                // Log as a warning or info since this is a controlled logic error (e.g., "User not found")
                _logger.LogWarning(ex, "Business logic error occurred: {Message}", ex.Message);
                await HandleExceptionAsync(context, ex);
            }
            catch (Exception ex)
            {
                // Log as Error since this is an unexpected crash
                _logger.LogError(ex, "An unhandled exception occurred during {Method} {Path}", context.Request.Method, context.Request.Path);
                await HandleGeneralExceptionAsync(context, ex);
            }
        }

        private static Task HandleExceptionAsync(HttpContext context, CustomErrorException ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = ex.StatusCode;

            // Ensure camelCase (errorCode vs ErrorCode)
            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

            var result = JsonSerializer.Serialize(ex.ErrorDetail, options);
            return context.Response.WriteAsync(result);
        }

        private Task HandleGeneralExceptionAsync(HttpContext context, Exception ex)
        {
            context.Response.ContentType = "application/json";
            context.Response.StatusCode = StatusCodes.Status500InternalServerError;

            var errorDetail = new ErrorDetail
            {
                ErrorCode = "INTERNAL_SERVER_ERROR",
                Message = _env.IsDevelopment() 
                    ? new { message = ex.Message, stackTrace = ex.StackTrace } 
                    : "An unexpected error server-side."
            };

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

            var result = JsonSerializer.Serialize(errorDetail, options);
            return context.Response.WriteAsync(result);
        }
    }
}
