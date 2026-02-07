using Application.DTOs.ImageDTOs;

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
        Task<IEnumerable<ImageResponseDto>> GetImagesAsync(string speciesId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Add an image to a species gallery.
        /// </summary>
        Task<ImageResponseDto> AddImageAsync(string speciesId, CreateImageDto dto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Remove an image from a species gallery.
        /// </summary>
        Task RemoveImageAsync(string speciesId, string imageId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Set the main thumbnail image for a species.
        /// </summary>
        Task SetThumbnailAsync(string speciesId, SetThumbnailDto dto, CancellationToken cancellationToken = default);
    }
}
