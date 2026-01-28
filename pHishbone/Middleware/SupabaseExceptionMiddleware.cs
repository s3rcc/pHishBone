using System.Text.Json;

namespace pHishbone.Middleware
{
    public class SupabaseExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<SupabaseExceptionMiddleware> _logger;

        public SupabaseExceptionMiddleware(RequestDelegate next, ILogger<SupabaseExceptionMiddleware> logger)
        {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                // 1. Check if this is a Supabase JSON Error
                if (IsSupabaseJsonError(ex))
                {
                    _logger.LogWarning("Supabase Auth Error caught: {Message}", ex.Message);
                    await HandleSupabaseErrorAsync(context, ex.Message);
                }
                else
                {
                    // 2. If it's NOT a Supabase error, re-throw it!
                    // The GeneralExceptionMiddleware (outer layer) will catch this.
                    throw;
                }
            }
        }

        private static bool IsSupabaseJsonError(Exception ex)
        {
            // Simple heuristic: Does it look like a JSON object containing "msg" or "error_description"?
            var msg = ex.Message.Trim();
            return (msg.StartsWith("{") && msg.EndsWith("}")) &&
                   (msg.Contains("\"msg\"") || msg.Contains("\"error_description\"") || msg.Contains("\"message\""));
        }

        private static async Task HandleSupabaseErrorAsync(HttpContext context, string jsonMessage)
        {
            context.Response.ContentType = "application/json";
            // Supabase errors are almost always user errors (400) or auth errors (401)
            context.Response.StatusCode = StatusCodes.Status400BadRequest;

            var cleanMessage = ExtractMessage(jsonMessage);

            var response = new
            {
                ErrorCode = "EXTERNAL_PROVIDER_ERROR",
                Message = cleanMessage
            };

            var options = new JsonSerializerOptions { PropertyNamingPolicy = JsonNamingPolicy.CamelCase };
            await context.Response.WriteAsync(JsonSerializer.Serialize(response, options));
        }

        private static string ExtractMessage(string json)
        {
            try
            {
                using var doc = JsonDocument.Parse(json);
                var root = doc.RootElement;

                // Try different standard Supabase error fields
                if (root.TryGetProperty("msg", out var msg)) return msg.GetString() ?? "Error";
                if (root.TryGetProperty("message", out var message)) return message.GetString() ?? "Error";
                if (root.TryGetProperty("error_description", out var desc)) return desc.GetString() ?? "Error";
            }
            catch
            {
                return "External Authentication Error";
            }
            return "External Authentication Error";
        }
    }
}
