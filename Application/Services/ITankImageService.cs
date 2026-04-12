using Application.DTOs.ImageDTOs;
using Microsoft.AspNetCore.Http;

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
        /// Add a single image to a tank gallery via file upload.
        /// </summary>
        Task<ImageResponseDto> AddImageAsync(string tankId, CreateImageDto dto, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Add multiple images to a tank gallery concurrently.
        /// </summary>
        Task<List<ImageResponseDto>> AddImagesAsync(string tankId, List<IFormFile> files, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Remove an image from a tank gallery and delete from CDN.
        /// </summary>
        Task RemoveImageAsync(string tankId, string imageId, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Set the main thumbnail image for a tank via file upload.
        /// </summary>
        Task SetThumbnailAsync(string tankId, SetThumbnailDto dto, string userId, CancellationToken cancellationToken = default);
    }
}
