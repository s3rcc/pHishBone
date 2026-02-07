using Application.DTOs.ImageDTOs;

namespace Application.Services
{
    /// <summary>
    /// Service interface for Tank image management operations.
    /// </summary>
    public interface ITankImageService
    {
        /// <summary>
        /// Get all images for a tank.
        /// </summary>
        Task<IEnumerable<ImageResponseDto>> GetImagesAsync(string tankId, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Add an image to a tank gallery.
        /// </summary>
        Task<ImageResponseDto> AddImageAsync(string tankId, CreateImageDto dto, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Remove an image from a tank gallery.
        /// </summary>
        Task RemoveImageAsync(string tankId, string imageId, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Set the main thumbnail image for a tank.
        /// </summary>
        Task SetThumbnailAsync(string tankId, SetThumbnailDto dto, string userId, CancellationToken cancellationToken = default);
    }
}
