using Application.DTOs.ImageDTOs;
using Application.Services;
using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Infrastructure.Settings;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using PhotoUploadResult = Application.DTOs.ImageDTOs.ImageUploadResult;

namespace Infrastructure.Services
{
    /// <summary>
    /// Cloudinary-backed photo service with batch upload/delete support.
    /// Uploads use Task.WhenAll for concurrency.
    /// Deletes use DeleteResourcesAsync for batch cleanup (up to 100 per call).
    /// All uploads enforce FetchFormat("auto") and Quality("auto").
    /// </summary>
    public class PhotoService : IPhotoService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<PhotoService> _logger;

        public PhotoService(IOptions<CloudinarySettings> config, ILogger<PhotoService> logger)
        {
            var settings = config.Value;
            var account = new Account(settings.CloudName, settings.ApiKey, settings.ApiSecret);
            _cloudinary = new Cloudinary(account);
            _logger = logger;
        }

        public async Task<PhotoUploadResult> AddPhotoAsync(IFormFile file, string folderName = "general")
        {
            if (file.Length <= 0)
            {
                return new PhotoUploadResult { IsSuccess = false, Error = "File is empty" };
            }

            await using var stream = file.OpenReadStream();
            var uploadParams = new ImageUploadParams
            {
                File = new FileDescription(file.FileName, stream),
                Folder = $"phishbone/{folderName}",
                Transformation = new Transformation().FetchFormat("auto").Quality("auto")
            };

            var result = await _cloudinary.UploadAsync(uploadParams);

            if (result.Error != null)
            {
                _logger.LogError("Cloudinary upload failed: {Error}", result.Error.Message);
                return new PhotoUploadResult { IsSuccess = false, Error = result.Error.Message };
            }

            _logger.LogInformation("Uploaded image to Cloudinary: {PublicId}", result.PublicId);

            return new PhotoUploadResult
            {
                IsSuccess = true,
                Url = result.SecureUrl.ToString(),
                PublicId = result.PublicId
            };
        }

        public async Task<string> DeletePhotoAsync(string publicId)
        {
            if (string.IsNullOrWhiteSpace(publicId))
            {
                return "PublicId is empty";
            }

            var deleteParams = new DeletionParams(publicId);
            var result = await _cloudinary.DestroyAsync(deleteParams);

            if (result.Result == "ok")
            {
                _logger.LogInformation("Deleted image from Cloudinary: {PublicId}", publicId);
                return "ok";
            }

            _logger.LogWarning("Failed to delete image from Cloudinary: {PublicId}, Result: {Result}", publicId, result.Result);
            return result.Result;
        }

        public async Task<List<PhotoUploadResult>> AddPhotosAsync(List<IFormFile> files, string folderName = "general")
        {
            var uploadTasks = files.Select(file => AddPhotoAsync(file, folderName));
            var results = await Task.WhenAll(uploadTasks);
            return results.ToList();
        }

        public async Task<List<string>> DeletePhotosAsync(List<string> publicIds)
        {
            if (publicIds == null || publicIds.Count == 0)
            {
                return new List<string>();
            }

            // Filter out nulls/empties
            var validIds = publicIds.Where(id => !string.IsNullOrWhiteSpace(id)).ToList();

            if (validIds.Count == 0)
            {
                return new List<string>();
            }

            // Cloudinary Admin API supports up to 100 per batch
            var results = new List<string>();
            var batches = validIds.Chunk(100);

            foreach (var batch in batches)
            {
                var deleteParams = new DelResParams
                {
                    PublicIds = batch.ToList(),
                    ResourceType = ResourceType.Image
                };

                var result = await _cloudinary.DeleteResourcesAsync(deleteParams);

                if (result.Error != null)
                {
                    _logger.LogError("Batch delete failed: {Error}", result.Error.Message);
                }
                else
                {
                    _logger.LogInformation("Batch deleted {Count} images from Cloudinary", batch.Length);
                    results.AddRange(batch);
                }
            }

            return results;
        }
    }
}
