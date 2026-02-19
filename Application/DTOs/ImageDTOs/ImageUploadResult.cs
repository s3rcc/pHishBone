namespace Application.DTOs.ImageDTOs
{
    /// <summary>
    /// Result of a Cloudinary image upload.
    /// </summary>
    public class ImageUploadResult
    {
        public bool IsSuccess { get; set; }
        public string? Url { get; set; }
        public string? PublicId { get; set; }
        public string? Error { get; set; }
    }
}
