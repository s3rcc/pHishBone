using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.ImageDTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities.Project;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services
{
    /// <summary>
    /// Service implementation for Tank image management.
    /// </summary>
    public class TankImageService : ITankImageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public TankImageService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<ImageResponseDto>> GetImagesAsync(string tankId, string userId, CancellationToken cancellationToken = default)
        {
            // Verify tank exists and user has access
            await GetTankWithAuthorizationAsync(tankId, userId);

            var images = await _unitOfWork.Repository<TankImage>().GetListAsync(
                predicate: ti => ti.TankId == tankId && ti.DeletedTime == null,
                orderBy: q => q.OrderBy(ti => ti.SortOrder).ThenByDescending(ti => ti.CreatedTime),
                tracking: false
            );

            return _mapper.Map<IEnumerable<ImageResponseDto>>(images);
        }

        public async Task<ImageResponseDto> AddImageAsync(string tankId, CreateImageDto dto, string userId, CancellationToken cancellationToken = default)
        {
            // Verify tank exists and user has access
            await GetTankWithAuthorizationAsync(tankId, userId);

            var image = new TankImage
            {
                TankId = tankId,
                ImageUrl = dto.ImageUrl,
                Caption = dto.Caption,
                SortOrder = dto.SortOrder,
                CreatedBy = _currentUserService.GetUserId()
            };

            await _unitOfWork.Repository<TankImage>().InsertAsync(image);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ImageResponseDto>(image);
        }

        public async Task RemoveImageAsync(string tankId, string imageId, string userId, CancellationToken cancellationToken = default)
        {
            // Verify tank exists and user has access
            await GetTankWithAuthorizationAsync(tankId, userId);

            var image = await _unitOfWork.Repository<TankImage>().SingleOrDefaultAsync(
                predicate: ti => ti.Id == imageId && ti.TankId == tankId && ti.DeletedTime == null
            );

            if (image == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.ImageNotFound
                );
            }

            // Hard delete for images
            _unitOfWork.Repository<TankImage>().Delete(image);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task SetThumbnailAsync(string tankId, SetThumbnailDto dto, string userId, CancellationToken cancellationToken = default)
        {
            var tank = await GetTankWithAuthorizationAsync(tankId, userId);

            tank.ThumbnailUrl = dto.ImageUrl;
            tank.LastUpdatedBy = _currentUserService.GetUserId();
            tank.LastUpdatedTime = DateTime.UtcNow;

            await _unitOfWork.Repository<Tank>().Update(tank);
            await _unitOfWork.SaveChangesAsync();
        }

        private async Task<Tank> GetTankWithAuthorizationAsync(string tankId, string userId)
        {
            var tank = await _unitOfWork.Repository<Tank>().SingleOrDefaultAsync(
                predicate: t => t.Id == tankId && t.DeletedTime == null
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
