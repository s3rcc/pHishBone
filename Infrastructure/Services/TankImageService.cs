using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.ImageDTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities.Project;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Service implementation for Tank image management.
    /// Uses IPhotoService for Cloudinary operations.
    /// </summary>
    public class TankImageService : ITankImageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPhotoService _photoService;
        private readonly ILogger<TankImageService> _logger;

        public TankImageService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            IPhotoService photoService,
            ILogger<TankImageService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _photoService = photoService;
            _logger = logger;
        }

        public async Task<IEnumerable<ImageResponseDto>> GetImagesAsync(string tankId, string userId, CancellationToken cancellationToken = default)
        {
            await GetTankWithAuthorizationAsync(tankId, userId, cancellationToken);

            var images = await _unitOfWork.Repository<TankImage>().GetListAsync(
                predicate: ti => ti.TankId == tankId && ti.DeletedTime == null,
                orderBy: q => q.OrderBy(ti => ti.SortOrder).ThenByDescending(ti => ti.CreatedTime),
                tracking: false,
                cancellationToken: cancellationToken
            );

            return _mapper.Map<IEnumerable<ImageResponseDto>>(images);
        }

        public async Task<ImageResponseDto> AddImageAsync(string tankId, CreateImageDto dto, string userId, CancellationToken cancellationToken = default)
        {
            await GetTankWithAuthorizationAsync(tankId, userId, cancellationToken);

            // Upload to Cloudinary
            var uploadResult = await _photoService.AddPhotoAsync(dto.File, "tanks", cancellationToken);

            if (!uploadResult.IsSuccess)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    $"Image upload failed: {uploadResult.Error}"
                );
            }

            var image = new TankImage
            {
                TankId = tankId,
                ImageUrl = uploadResult.Url!,
                PublicId = uploadResult.PublicId,
                Caption = dto.Caption,
                SortOrder = dto.SortOrder,
                CreatedBy = _currentUserService.GetUserId()
            };

            await _unitOfWork.Repository<TankImage>().InsertAsync(image, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Added image {PublicId} to tank {TankId}", uploadResult.PublicId, tankId);

            return _mapper.Map<ImageResponseDto>(image);
        }

        public async Task<List<ImageResponseDto>> AddImagesAsync(string tankId, List<IFormFile> files, string userId, CancellationToken cancellationToken = default)
        {
            await GetTankWithAuthorizationAsync(tankId, userId, cancellationToken);

            // Concurrent upload via Task.WhenAll
            var uploadResults = await _photoService.AddPhotosAsync(files, "tanks", cancellationToken);
            var successResults = uploadResults.Where(r => r.IsSuccess).ToList();

            if (successResults.Count == 0)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    ProjectErrorMessageConstant.AllUploadsFailedMessage
                );
            }

            var currentUserId = _currentUserService.GetUserId();
            var images = successResults.Select((result, index) => new TankImage
            {
                TankId = tankId,
                ImageUrl = result.Url!,
                PublicId = result.PublicId,
                SortOrder = index,
                CreatedBy = currentUserId
            }).ToList();

            foreach (var image in images)
            {
                await _unitOfWork.Repository<TankImage>().InsertAsync(image, cancellationToken);
            }
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Added {Count} images to tank {TankId}", images.Count, tankId);

            return _mapper.Map<List<ImageResponseDto>>(images);
        }

        public async Task RemoveImageAsync(string tankId, string imageId, string userId, CancellationToken cancellationToken = default)
        {
            await GetTankWithAuthorizationAsync(tankId, userId, cancellationToken);

            var image = await _unitOfWork.Repository<TankImage>().SingleOrDefaultAsync(
                predicate: ti => ti.Id == imageId && ti.TankId == tankId && ti.DeletedTime == null,
                cancellationToken: cancellationToken
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
            _unitOfWork.Repository<TankImage>().Delete(image);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Cleanup CDN
            if (!string.IsNullOrEmpty(image.PublicId))
            {
                await _photoService.DeletePhotoAsync(image.PublicId, cancellationToken);
            }

            _logger.LogInformation("Removed image {ImageId} from tank {TankId}", imageId, tankId);
        }

        public async Task SetThumbnailAsync(string tankId, SetThumbnailDto dto, string userId, CancellationToken cancellationToken = default)
        {
            var tank = await GetTankWithAuthorizationAsync(tankId, userId, cancellationToken);

            // Upload new thumbnail
            var uploadResult = await _photoService.AddPhotoAsync(dto.File, "tanks/thumbnails", cancellationToken);

            if (!uploadResult.IsSuccess)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    $"Thumbnail upload failed: {uploadResult.Error}"
                );
            }

            // Delete old thumbnail from CDN if exists
            var oldPublicId = tank.ThumbnailPublicId;

            tank.ThumbnailUrl = uploadResult.Url;
            tank.ThumbnailPublicId = uploadResult.PublicId;
            tank.LastUpdatedBy = _currentUserService.GetUserId();
            tank.LastUpdatedTime = DateTime.UtcNow;

            await _unitOfWork.Repository<Tank>().Update(tank);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            if (!string.IsNullOrEmpty(oldPublicId))
            {
                await _photoService.DeletePhotoAsync(oldPublicId, cancellationToken);
            }

            _logger.LogInformation("Set thumbnail for tank {TankId}: {PublicId}", tankId, uploadResult.PublicId);
        }

        private async Task<Tank> GetTankWithAuthorizationAsync(string tankId, string userId, CancellationToken cancellationToken = default)
        {
            var tank = await _unitOfWork.Repository<Tank>().SingleOrDefaultAsync(
                predicate: t => t.Id == tankId && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );

            if (tank == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ProjectErrorMessageConstant.TankNotFound
                );
            }

            if (tank.UserId != userId)
            {
                throw new CustomErrorException(
                    StatusCodes.Status403Forbidden,
                    ErrorCode.FORBIDDEN,
                    ProjectErrorMessageConstant.UnauthorizedAccess
                );
            }

            return tank;
        }
    }
}
