using System.Text.Json.Serialization;

namespace Domain.Exceptions
{
    public class CustomErrorException : Exception
    {
        public int StatusCode { get; }
        public ErrorDetail ErrorDetail { get; }

        public CustomErrorException(int statusCode, string errorCode, string message = null)
        {
            StatusCode = statusCode;
            ErrorDetail = new ErrorDetail
            {
                ErrorCode = errorCode,
                Message = message
            };
        }
    }
    public class ErrorDetail
    {
        [JsonPropertyName("errorCode")] public string ErrorCode { get; set; }

        [JsonPropertyName("message")] public object Message { get; set; }
    }
}
