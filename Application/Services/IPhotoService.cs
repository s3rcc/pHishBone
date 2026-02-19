using Application.DTOs.ImageDTOs;
using Microsoft.AspNetCore.Http;

namespace Application.Services
{
    /// <summary>
    /// Service interface for Cloudinary image operations.
    /// Supports single and batch upload/delete with on-the-fly optimization.
    /// </summary>
    public interface IPhotoService
    {
        /// <summary>
        /// Upload a single photo to Cloudinary.
        /// </summary>
        Task<ImageUploadResult> AddPhotoAsync(IFormFile file, string folderName = "general");

        /// <summary>
        /// Delete a single photo from Cloudinary by public ID.
        /// </summary>
        Task<string> DeletePhotoAsync(string publicId);

        /// <summary>
        /// Upload multiple photos concurrently using Task.WhenAll.
        /// </summary>
        Task<List<ImageUploadResult>> AddPhotosAsync(List<IFormFile> files, string folderName = "general");

        /// <summary>
        /// Delete multiple photos in a single Cloudinary API call (up to 100).
        /// </summary>
        Task<List<string>> DeletePhotosAsync(List<string> publicIds);
    }
}
