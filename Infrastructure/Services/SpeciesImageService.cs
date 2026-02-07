using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.ImageDTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities.Catalog;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services
{
    /// <summary>
    /// Service implementation for Species image management.
    /// </summary>
    public class SpeciesImageService : ISpeciesImageService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public SpeciesImageService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<ImageResponseDto>> GetImagesAsync(string speciesId, CancellationToken cancellationToken = default)
        {
            // Verify species exists
            await VerifySpeciesExistsAsync(speciesId);

            var images = await _unitOfWork.Repository<SpeciesImage>().GetListAsync(
                predicate: si => si.SpeciesId == speciesId && si.DeletedTime == null,
                orderBy: q => q.OrderBy(si => si.SortOrder).ThenByDescending(si => si.CreatedTime),
                tracking: false
            );

            return _mapper.Map<IEnumerable<ImageResponseDto>>(images);
        }

        public async Task<ImageResponseDto> AddImageAsync(string speciesId, CreateImageDto dto, CancellationToken cancellationToken = default)
        {
            // Verify species exists
            await VerifySpeciesExistsAsync(speciesId);

            var image = new SpeciesImage
            {
                SpeciesId = speciesId,
                ImageUrl = dto.ImageUrl,
                Caption = dto.Caption,
                SortOrder = dto.SortOrder,
                CreatedBy = _currentUserService.GetUserId()
            };

            await _unitOfWork.Repository<SpeciesImage>().InsertAsync(image);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<ImageResponseDto>(image);
        }

        public async Task RemoveImageAsync(string speciesId, string imageId, CancellationToken cancellationToken = default)
        {
            // Verify species exists
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

            // Hard delete for images
            _unitOfWork.Repository<SpeciesImage>().Delete(image);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task SetThumbnailAsync(string speciesId, SetThumbnailDto dto, CancellationToken cancellationToken = default)
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

            species.ThumbnailUrl = dto.ImageUrl;
            species.LastUpdatedBy = _currentUserService.GetUserId();
            species.LastUpdatedTime = DateTime.UtcNow;

            await _unitOfWork.Repository<Species>().Update(species);
            await _unitOfWork.SaveChangesAsync();
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
