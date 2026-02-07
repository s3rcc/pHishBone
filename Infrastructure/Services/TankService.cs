using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.ProjectDTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities.Project;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Services
{
    /// <summary>
    /// Service implementation for tank management operations.
    /// </summary>
    public class TankService : ITankService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public TankService(IUnitOfWork unitOfWork, IMapper mapper, ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<IEnumerable<TankListItemDto>> GetUserTanksAsync(string userId, CancellationToken cancellationToken = default)
        {
            var tanks = await _unitOfWork.Repository<Tank>().GetListAsync(
                predicate: t => t.UserId == userId && t.DeletedTime == null,
                include: q => q.Include(t => t.TankItems),
                orderBy: q => q.OrderByDescending(t => t.CreatedTime),
                tracking: false
            );

            return _mapper.Map<IEnumerable<TankListItemDto>>(tanks);
        }

        public async Task<TankResponseDto> GetTankByIdAsync(string tankId, string userId, CancellationToken cancellationToken = default)
        {
            var tank = await _unitOfWork.Repository<Tank>().SingleOrDefaultAsync(
                predicate: t => t.Id == tankId && t.DeletedTime == null,
                include: q => q.Include(t => t.TankItems),
                tracking: false
            );

            if (tank == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ProjectErrorMessageConstant.TankNotFound
                );
            }

            // Authorization check
            if (tank.UserId != userId)
            {
                throw new CustomErrorException(
                    StatusCodes.Status403Forbidden,
                    ErrorCode.FORBIDDEN,
                    ProjectErrorMessageConstant.UnauthorizedAccess
                );
            }

            return _mapper.Map<TankResponseDto>(tank);
        }

        public async Task<TankResponseDto> CreateTankAsync(CreateTankDto dto, string userId, CancellationToken cancellationToken = default)
        {
            var tank = _mapper.Map<Tank>(dto);
            tank.UserId = userId;
            tank.CreatedBy = _currentUserService.GetUserId();

            await _unitOfWork.Repository<Tank>().InsertAsync(tank);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<TankResponseDto>(tank);
        }

        public async Task<TankResponseDto> UpdateTankAsync(string tankId, UpdateTankDto dto, string userId, CancellationToken cancellationToken = default)
        {
            var tank = await _unitOfWork.Repository<Tank>().SingleOrDefaultAsync(
                predicate: t => t.Id == tankId && t.DeletedTime == null,
                include: q => q.Include(t => t.TankItems)
            );

            if (tank == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ProjectErrorMessageConstant.TankNotFound
                );
            }

            // Authorization check
            if (tank.UserId != userId)
            {
                throw new CustomErrorException(
                    StatusCodes.Status403Forbidden,
                    ErrorCode.FORBIDDEN,
                    ProjectErrorMessageConstant.UnauthorizedAccess
                );
            }

            _mapper.Map(dto, tank);
            tank.LastUpdatedBy = _currentUserService.GetUserId();
            tank.LastUpdatedTime = DateTime.UtcNow;

            await _unitOfWork.Repository<Tank>().Update(tank);
            await _unitOfWork.SaveChangesAsync();

            return _mapper.Map<TankResponseDto>(tank);
        }

        public async Task DeleteTankAsync(string tankId, string userId, CancellationToken cancellationToken = default)
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

            // Authorization check
            if (tank.UserId != userId)
            {
                throw new CustomErrorException(
                    StatusCodes.Status403Forbidden,
                    ErrorCode.FORBIDDEN,
                    ProjectErrorMessageConstant.UnauthorizedAccess
                );
            }

            // Soft delete
            tank.DeletedTime = DateTime.UtcNow;
            tank.DeletedBy = _currentUserService.GetUserId();

            await _unitOfWork.Repository<Tank>().Update(tank);
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<TankSnapshotResponseDto?> GetLatestSnapshotAsync(string tankId, CancellationToken cancellationToken = default)
        {
            var snapshot = await _unitOfWork.Repository<TankSnapshot>().SingleOrDefaultAsync(
                predicate: s => s.TankId == tankId && s.DeletedTime == null,
                orderBy: q => q.OrderByDescending(s => s.CreatedTime),
                tracking: false
            );

            if (snapshot == null)
            {
                return null;
            }

            return _mapper.Map<TankSnapshotResponseDto>(snapshot);
        }
    }
}
