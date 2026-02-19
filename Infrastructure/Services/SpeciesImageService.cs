using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.ImageDTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities.Catalog;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Service implementation for Species image management.
    /// Uses IPhotoService for Cloudinary operations.
    /// </summary>
    public class SpeciesImageService : ISpeciesImageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPhotoService _photoService;
        private readonly ILogger<SpeciesImageService> _logger;

        public SpeciesImageService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            IPhotoService photoService,
            ILogger<SpeciesImageService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _photoService = photoService;
            _logger = logger;
        }

        public async Task<IEnumerable<ImageResponseDto>> GetImagesAsync(string speciesId)
        {
            await VerifySpeciesExistsAsync(speciesId);

            var images = await _unitOfWork.Repository<SpeciesImage>().GetListAsync(
                predicate: si => si.SpeciesId == speciesId && si.DeletedTime == null,
                orderBy: q => q.OrderBy(si => si.SortOrder).ThenByDescending(si => si.CreatedTime),
                tracking: false
            );

            return _mapper.Map<IEnumerable<ImageResponseDto>>(images);
        }

        public async Task<ImageResponseDto> AddImageAsync(string speciesId, CreateImageDto dto)
        {
            await VerifySpeciesExistsAsync(speciesId);

            // Upload to Cloudinary
            var uploadResult = await _photoService.AddPhotoAsync(dto.File, "species");

            if (!uploadResult.IsSuccess)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    $"Image upload failed: {uploadResult.Error}"
                );
            }

            var image = new SpeciesImage
            {
                SpeciesId = speciesId,
                ImageUrl = uploadResult.Url!,
                PublicId = uploadResult.PublicId,
                Caption = dto.Caption,
                SortOrder = dto.SortOrder,
                CreatedBy = _currentUserService.GetUserId()
            };

            await _unitOfWork.Repository<SpeciesImage>().InsertAsync(image);
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Added image {PublicId} to species {SpeciesId}", uploadResult.PublicId, speciesId);

            return _mapper.Map<ImageResponseDto>(image);
        }

        public async Task<List<ImageResponseDto>> AddImagesAsync(string speciesId, List<IFormFile> files)
        {
            await VerifySpeciesExistsAsync(speciesId);

            // Concurrent upload via Task.WhenAll
            var uploadResults = await _photoService.AddPhotosAsync(files, "species");
            var successResults = uploadResults.Where(r => r.IsSuccess).ToList();

            if (successResults.Count == 0)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    CatalogErrorMessageConstant.AllUploadsFailedMessage
                );
            }

            var userId = _currentUserService.GetUserId();
            var images = successResults.Select((result, index) => new SpeciesImage
            {
                SpeciesId = speciesId,
                ImageUrl = result.Url!,
                PublicId = result.PublicId,
                SortOrder = index,
                CreatedBy = userId
            }).ToList();

            foreach (var image in images)
            {
                await _unitOfWork.Repository<SpeciesImage>().InsertAsync(image);
            }
            await _unitOfWork.SaveChangesAsync();

            _logger.LogInformation("Added {Count} images to species {SpeciesId}", images.Count, speciesId);

            return _mapper.Map<List<ImageResponseDto>>(images);
        }

        public async Task RemoveImageAsync(string speciesId, string imageId)
        {
            await VerifySpeciesExistsAsync(speciesId);

            var image = await _unitOfWork.Repository<SpeciesImage>().SingleOrDefaultAsync(
                predicate: si => si.Id == imageId && si.SpeciesId == speciesId && si.DeletedTime == null
            );

            if (image == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.ImageNotFound
                );
            }

            // Delete from DB first
            _unitOfWork.Repository<SpeciesImage>().Delete(image);
            await _unitOfWork.SaveChangesAsync();

            // Cleanup CDN (fire-and-forget safe: DB is already consistent)
            if (!string.IsNullOrEmpty(image.PublicId))
            {
                await _photoService.DeletePhotoAsync(image.PublicId);
            }

            _logger.LogInformation("Removed image {ImageId} from species {SpeciesId}", imageId, speciesId);
        }

        public async Task SetThumbnailAsync(string speciesId, SetThumbnailDto dto)
        {
            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Id == speciesId && s.DeletedTime == null
            );

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            // Upload new thumbnail
            var uploadResult = await _photoService.AddPhotoAsync(dto.File, "species/thumbnails");

            if (!uploadResult.IsSuccess)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    $"Thumbnail upload failed: {uploadResult.Error}"
                );
            }

            // Delete old thumbnail from CDN if exists
            var oldPublicId = species.ThumbnailPublicId;

            species.ThumbnailUrl = uploadResult.Url;
            species.ThumbnailPublicId = uploadResult.PublicId;
            species.LastUpdatedBy = _currentUserService.GetUserId();
            species.LastUpdatedTime = DateTime.UtcNow;

            await _unitOfWork.Repository<Species>().Update(species);
            await _unitOfWork.SaveChangesAsync();

            if (!string.IsNullOrEmpty(oldPublicId))
            {
                await _photoService.DeletePhotoAsync(oldPublicId);
            }

            _logger.LogInformation("Set thumbnail for species {SpeciesId}: {PublicId}", speciesId, uploadResult.PublicId);
        }

        private async Task VerifySpeciesExistsAsync(string speciesId)
        {
            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Id == speciesId && s.DeletedTime == null,
                tracking: false
            );

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }
        }
    }
}
