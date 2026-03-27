using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.AiDTOs;
using AutoMapper;
using Domain.Entities.Ai;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;

namespace Infrastructure.Services
{
    public class AiModelConfigService : IAiModelConfigService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public AiModelConfigService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<AiModelConfigDto> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var entity = await GetEntityByIdAsync(id);
            return _mapper.Map<AiModelConfigDto>(entity);
        }

        public async Task<ICollection<AiModelConfigDto>> GetListAsync(CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.Repository<AiModelConfig>().GetListAsync(
                predicate: x => x.DeletedTime == null,
                orderBy: q => q.OrderBy(x => x.DisplayName)
            );

            return _mapper.Map<ICollection<AiModelConfigDto>>(items);
        }

        public async Task<PaginationResponse<AiModelConfigDto>> GetPaginatedListAsync(AiModelConfigFilterDto filter, CancellationToken cancellationToken = default)
        {
            var paging = await _unitOfWork.Repository<AiModelConfig>().GetPagingListAsync(
                predicate: BuildFilterPredicate(filter),
                page: filter.Page,
                size: filter.Size,
                sortBy: filter.SortBy,
                isAsc: filter.IsAscending
            );

            return new PaginationResponse<AiModelConfigDto>
            {
                Page = paging.Page,
                Size = paging.Size,
                Total = paging.Total,
                TotalPages = paging.TotalPages,
                Items = _mapper.Map<IList<AiModelConfigDto>>(paging.Items)
            };
        }

        public async Task<ICollection<AiModelConfigDto>> GetAvailableAsync(CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.Repository<AiModelConfig>().GetListAsync(
                predicate: x => x.DeletedTime == null && x.IsEnabled,
                orderBy: q => q.OrderBy(x => x.DisplayName)
            );

            return _mapper.Map<ICollection<AiModelConfigDto>>(items);
        }

        public async Task<AiModelConfigDto> CreateAsync(CreateAiModelConfigDto dto, CancellationToken cancellationToken = default)
        {
            Normalize(dto);
            await EnsureModelUniquenessAsync(dto.DisplayName, dto.ProviderModelId, dto.Provider, null);

            var entity = _mapper.Map<AiModelConfig>(dto);
            entity.CreatedBy = _currentUserService.GetUserId();

            await _unitOfWork.Repository<AiModelConfig>().InsertAsync(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return _mapper.Map<AiModelConfigDto>(entity);
        }

        public async Task<AiModelConfigDto> UpdateAsync(string id, UpdateAiModelConfigDto dto, CancellationToken cancellationToken = default)
        {
            Normalize(dto);

            var entity = await GetEntityByIdAsync(id);
            await EnsureModelUniquenessAsync(dto.DisplayName, dto.ProviderModelId, dto.Provider, id);

            _mapper.Map(dto, entity);
            entity.LastUpdatedBy = _currentUserService.GetUserId();
            entity.LastUpdatedTime = DateTime.UtcNow;

            await _unitOfWork.Repository<AiModelConfig>().Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return _mapper.Map<AiModelConfigDto>(entity);
        }

        public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
        {
            var entity = await GetEntityByIdAsync(id);
            entity.DeletedBy = _currentUserService.GetUserId();
            entity.DeletedTime = DateTime.UtcNow;
            entity.LastUpdatedBy = _currentUserService.GetUserId();
            entity.LastUpdatedTime = DateTime.UtcNow;

            await _unitOfWork.Repository<AiModelConfig>().Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        private async Task<AiModelConfig> GetEntityByIdAsync(string id)
        {
            var entity = await _unitOfWork.Repository<AiModelConfig>().SingleOrDefaultAsync(
                predicate: x => x.Id == id && x.DeletedTime == null
            );

            if (entity == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    AiErrorMessageConstant.AiModelNotFound
                );
            }

            return entity;
        }

        private async Task EnsureModelUniquenessAsync(string displayName, string providerModelId, Domain.Enums.AiProvider provider, string? excludedId)
        {
            var existingDisplayName = await _unitOfWork.Repository<AiModelConfig>().SingleOrDefaultAsync(
                predicate: x => x.DeletedTime == null && x.DisplayName == displayName && x.Id != excludedId
            );

            if (existingDisplayName != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    AiErrorMessageConstant.AiModelDuplicateDisplayName
                );
            }

            var existingProviderModel = await _unitOfWork.Repository<AiModelConfig>().SingleOrDefaultAsync(
                predicate: x => x.DeletedTime == null
                    && x.Provider == provider
                    && x.ProviderModelId == providerModelId
                    && x.Id != excludedId
            );

            if (existingProviderModel != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    AiErrorMessageConstant.AiModelDuplicateProviderModel
                );
            }
        }

        private static System.Linq.Expressions.Expression<Func<AiModelConfig, bool>> BuildFilterPredicate(AiModelConfigFilterDto filter)
        {
            var normalizedSearch = NormalizeSearch(filter.SearchTerm);
            return x =>
                x.DeletedTime == null &&
                (string.IsNullOrWhiteSpace(normalizedSearch) ||
                 x.DisplayName.Contains(normalizedSearch) ||
                 x.ProviderModelId.Contains(normalizedSearch)) &&
                (!filter.Provider.HasValue || x.Provider == filter.Provider.Value) &&
                (!filter.IsEnabled.HasValue || x.IsEnabled == filter.IsEnabled.Value);
        }

        private static void Normalize(CreateAiModelConfigDto dto)
        {
            dto.DisplayName = dto.DisplayName.Trim();
            dto.ProviderModelId = dto.ProviderModelId.Trim();
            dto.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        }

        private static void Normalize(UpdateAiModelConfigDto dto)
        {
            dto.DisplayName = dto.DisplayName.Trim();
            dto.ProviderModelId = dto.ProviderModelId.Trim();
            dto.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
        }

        private static string? NormalizeSearch(string? searchTerm)
        {
            return string.IsNullOrWhiteSpace(searchTerm) ? null : searchTerm.Trim();
        }
    }
}
