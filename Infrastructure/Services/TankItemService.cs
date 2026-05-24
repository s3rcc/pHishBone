using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.ProjectDTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities.Catalog;
using Domain.Entities.Project;
using Domain.Enums;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    /// <summary>
    /// Service implementation for tank item management operations.
    /// </summary>
    public class TankItemService : ITankItemService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly ITankAnalysisService _tankAnalysisService;

        public TankItemService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            ITankAnalysisService tankAnalysisService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _tankAnalysisService = tankAnalysisService;
        }

        public async Task<IEnumerable<TankItemResponseDto>> GetTankItemsAsync(string tankId, string userId, CancellationToken cancellationToken = default)
        {
            // Verify tank exists and user has access
            var tank = await GetTankWithAuthorizationAsync(tankId, userId, cancellationToken);

            var items = await _unitOfWork.Repository<TankItem>().GetListAsync(
                predicate: ti => ti.TankId == tankId && ti.DeletedTime == null,
                orderBy: q => q.OrderByDescending(ti => ti.CreatedTime),
                tracking: false,
                cancellationToken: cancellationToken
            );

            return _mapper.Map<IEnumerable<TankItemResponseDto>>(items);
        }

        public async Task<TankItemMutationResponseDto> AddItemAsync(string tankId, AddTankItemDto dto, string userId, CancellationToken cancellationToken = default)
        {
            // Verify tank exists and user has access
            var tank = await GetTankWithAuthorizationAsync(tankId, userId, cancellationToken);

            // Validate catalog existence
            await ValidateCatalogReferenceAsync(dto.ItemType, dto.ReferenceId, cancellationToken);

            // Check if item already exists in tank (merge logic)
            var existingItem = await _unitOfWork.Repository<TankItem>().SingleOrDefaultAsync(
                predicate: ti => ti.TankId == tankId &&
                                 ti.ReferenceId == dto.ReferenceId &&
                                 ti.ItemType == dto.ItemType &&
                                 ti.DeletedTime == null,
                cancellationToken: cancellationToken
            );

            TankItem tankItem;

            if (existingItem != null)
            {
                // Merge: Add quantity to existing item
                existingItem.Quantity += dto.Quantity;
                if (!string.IsNullOrEmpty(dto.Note))
                {
                    existingItem.Note = dto.Note; // Update note if provided
                }
                existingItem.LastUpdatedBy = _currentUserService.GetUserId();
                existingItem.LastUpdatedTime = DateTime.UtcNow;

                await _unitOfWork.Repository<TankItem>().Update(existingItem);
                tankItem = existingItem;
            }
            else
            {
                // Create new item
                tankItem = _mapper.Map<TankItem>(dto);
                tankItem.TankId = tankId;
                tankItem.CreatedBy = _currentUserService.GetUserId();

                await _unitOfWork.Repository<TankItem>().InsertAsync(tankItem, cancellationToken);
                tank.TankItems.Add(tankItem);
            }

            // Invalidate tank - set status to Draft when inventory changes
            await InvalidateTankStatusAsync(tank);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return await BuildMutationResponseAsync(tank, tankItem, cancellationToken);
        }

        public async Task<TankItemMutationResponseDto> UpdateItemAsync(string tankId, string itemId, UpdateTankItemDto dto, string userId, CancellationToken cancellationToken = default)
        {
            // Verify tank exists and user has access
            var tank = await GetTankWithAuthorizationAsync(tankId, userId, cancellationToken);

            var tankItem = await _unitOfWork.Repository<TankItem>().SingleOrDefaultAsync(
                predicate: ti => ti.Id == itemId && ti.TankId == tankId && ti.DeletedTime == null,
                cancellationToken: cancellationToken
            );

            if (tankItem == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ProjectErrorMessageConstant.TankItemNotFound
                );
            }

            _mapper.Map(dto, tankItem);
            tankItem.LastUpdatedBy = _currentUserService.GetUserId();
            tankItem.LastUpdatedTime = DateTime.UtcNow;

            await _unitOfWork.Repository<TankItem>().Update(tankItem);

            // Invalidate tank status
            await InvalidateTankStatusAsync(tank);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return await BuildMutationResponseAsync(tank, tankItem, cancellationToken);
        }

        public async Task<TankItemMutationResponseDto> RemoveItemAsync(string tankId, string itemId, string userId, CancellationToken cancellationToken = default)
        {
            // Verify tank exists and user has access
            var tank = await GetTankWithAuthorizationAsync(tankId, userId, cancellationToken);

            var tankItem = await _unitOfWork.Repository<TankItem>().SingleOrDefaultAsync(
                predicate: ti => ti.Id == itemId && ti.TankId == tankId && ti.DeletedTime == null,
                cancellationToken: cancellationToken
            );

            if (tankItem == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ProjectErrorMessageConstant.TankItemNotFound
                );
            }

            // Hard delete for tank items
            _unitOfWork.Repository<TankItem>().Delete(tankItem);
            tank.TankItems.Remove(tankItem);

            // Invalidate tank status
            await InvalidateTankStatusAsync(tank);

            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return await BuildMutationResponseAsync(tank, null, cancellationToken);
        }

        #region Private Helper Methods

        /// <summary>
        /// Verify tank exists and user has authorization.
        /// </summary>
        private async Task<Tank> GetTankWithAuthorizationAsync(string tankId, string userId, CancellationToken cancellationToken = default)
        {
            var tank = await _unitOfWork.Repository<Tank>().SingleOrDefaultAsync(
                predicate: t => t.Id == tankId && t.DeletedTime == null,
                include: q => q.Include(t => t.TankItems),
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

        /// <summary>
        /// Validate that the reference exists in the catalog.
        /// </summary>
        private async Task ValidateCatalogReferenceAsync(ItemType itemType, string referenceId, CancellationToken cancellationToken = default)
        {
            if (itemType == ItemType.Species)
            {
                var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                    predicate: s => s.Id == referenceId && s.DeletedTime == null,
                    tracking: false,
                    cancellationToken: cancellationToken
                );

                if (species == null)
                {
                    throw new CustomErrorException(
                        StatusCodes.Status404NotFound,
                        ErrorCode.NOT_FOUND,
                        ProjectErrorMessageConstant.SpeciesNotFoundInCatalog
                    );
                }
            }
            // TODO: Add Product validation when Products table is implemented
            // else if (itemType == ItemType.Product)
            // {
            //     var product = await _unitOfWork.Repository<Product>().SingleOrDefaultAsync(...);
            // }
        }

        /// <summary>
        /// Invalidate tank by setting status to Draft when inventory changes.
        /// </summary>
        private async Task InvalidateTankStatusAsync(Tank tank)
        {
            tank.Status = TankStatus.Draft;
            tank.LastUpdatedBy = _currentUserService.GetUserId();
            tank.LastUpdatedTime = DateTime.UtcNow;
            await _unitOfWork.Repository<Tank>().Update(tank);
        }

        private async Task<TankItemMutationResponseDto> BuildMutationResponseAsync(
            Tank tank,
            TankItem? tankItem,
            CancellationToken cancellationToken)
        {
            var analysis = await _tankAnalysisService.GetTankAnalysisForTankAsync(tank, cancellationToken);
            var itemCount = tank.TankItems.Count(item => item.DeletedTime == null);

            return new TankItemMutationResponseDto(
                tankItem == null ? null : _mapper.Map<TankItemResponseDto>(tankItem),
                analysis,
                itemCount,
                tank.Status,
                tank.LastUpdatedTime);
        }

        #endregion
    }
}
