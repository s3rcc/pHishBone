using Application.DTOs.ImageDTOs;
using Microsoft.AspNetCore.Http;

namespace Application.Services
{
    /// <summary>
    /// Service interface for Species image management operations.
    /// </summary>
    public interface ISpeciesImageService
    {
        /// <summary>
        /// Get all images for a species.
        /// </summary>
        Task<IEnumerable<ImageResponseDto>> GetImagesAsync(string speciesId);

        /// <summary>
        /// Add a single image to a species gallery via file upload.
        /// </summary>
        Task<ImageResponseDto> AddImageAsync(string speciesId, CreateImageDto dto);

        /// <summary>
        /// Add multiple images to a species gallery concurrently.
        /// </summary>
        Task<List<ImageResponseDto>> AddImagesAsync(string speciesId, List<IFormFile> files);

        /// <summary>
        /// Remove an image from a species gallery and delete from CDN.
        /// </summary>
        Task RemoveImageAsync(string speciesId, string imageId);

        /// <summary>
        /// Set the main thumbnail image for a species via file upload.
        /// </summary>
        Task SetThumbnailAsync(string speciesId, SetThumbnailDto dto);
    }
}
