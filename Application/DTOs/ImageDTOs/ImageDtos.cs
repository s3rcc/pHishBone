namespace Application.DTOs.ImageDTOs
{
    /// <summary>
    /// DTO for creating a new gallery image.
    /// </summary>
    public record CreateImageDto(
        string ImageUrl,
        string? Caption,
        int SortOrder = 0
    );

    /// <summary>
    /// DTO for gallery image response.
    /// </summary>
    public record ImageResponseDto(
        string Id,
        string ImageUrl,
        string? Caption,
        int SortOrder,
        DateTime CreatedTime
    );

    /// <summary>
    /// DTO for setting the main thumbnail image.
    /// </summary>
    public record SetThumbnailDto(
        string ImageUrl
    );
}
