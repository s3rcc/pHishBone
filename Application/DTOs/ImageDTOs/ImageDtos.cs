using Microsoft.AspNetCore.Http;

namespace Application.DTOs.ImageDTOs
{
    /// <summary>
    /// DTO for creating a new gallery image via file upload.
    /// </summary>
    public record CreateImageDto(
        IFormFile File,
        string? Caption,
        int SortOrder = 0
    );

    /// <summary>
    /// DTO for gallery image response.
    /// </summary>
    public record ImageResponseDto(
        string Id,
        string ImageUrl,
        string? PublicId,
        string? Caption,
        int SortOrder,
        DateTime CreatedTime
    );

    /// <summary>
    /// DTO for setting the main thumbnail image via file upload.
    /// </summary>
    public record SetThumbnailDto(
        IFormFile File
    );
}
