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
    public class AiPromptTemplateService : IAiPromptTemplateService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;

        public AiPromptTemplateService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
        }

        public async Task<AiPromptTemplateDto> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var entity = await GetEntityByIdAsync(id, cancellationToken);
            return _mapper.Map<AiPromptTemplateDto>(entity);
        }

        public async Task<ICollection<AiPromptTemplateDto>> GetListAsync(CancellationToken cancellationToken = default)
        {
            var items = await _unitOfWork.Repository<AiPromptTemplate>().GetListAsync(
                predicate: x => x.DeletedTime == null,
                orderBy: q => q.OrderBy(x => x.Name),
                cancellationToken: cancellationToken
            );

            return _mapper.Map<ICollection<AiPromptTemplateDto>>(items);
        }

        public async Task<PaginationResponse<AiPromptTemplateDto>> GetPaginatedListAsync(AiPromptTemplateFilterDto filter, CancellationToken cancellationToken = default)
        {
            var paging = await _unitOfWork.Repository<AiPromptTemplate>().GetPagingListAsync(
                predicate: BuildFilterPredicate(filter),
                page: filter.Page,
                size: filter.Size,
                sortBy: filter.SortBy,
                isAsc: filter.IsAscending,
                cancellationToken: cancellationToken
            );

            return new PaginationResponse<AiPromptTemplateDto>
            {
                Page = paging.Page,
                Size = paging.Size,
                Total = paging.Total,
                TotalPages = paging.TotalPages,
                Items = _mapper.Map<IList<AiPromptTemplateDto>>(paging.Items)
            };
        }

        public async Task<AiPromptTemplateDto> CreateAsync(CreateAiPromptTemplateDto dto, CancellationToken cancellationToken = default)
        {
            Normalize(dto);
            await EnsurePromptNameUniquenessAsync(dto.Name, null, cancellationToken);

            var entity = _mapper.Map<AiPromptTemplate>(dto);
            entity.CreatedBy = _currentUserService.GetUserId();

            if (entity.IsActive)
            {
                await DeactivateOtherPromptsAsync(entity.UseCase, null, cancellationToken);
            }

            await _unitOfWork.Repository<AiPromptTemplate>().InsertAsync(entity, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return _mapper.Map<AiPromptTemplateDto>(entity);
        }

        public async Task<AiPromptTemplateDto> UpdateAsync(string id, UpdateAiPromptTemplateDto dto, CancellationToken cancellationToken = default)
        {
            Normalize(dto);

            var entity = await GetEntityByIdAsync(id, cancellationToken);
            await EnsurePromptNameUniquenessAsync(dto.Name, id, cancellationToken);

            if (dto.IsActive && !dto.IsEnabled)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.VALIDATION_ERROR,
                    AiErrorMessageConstant.AiPromptActiveRequiresEnabled
                );
            }

            _mapper.Map(dto, entity);
            entity.LastUpdatedBy = _currentUserService.GetUserId();
            entity.LastUpdatedTime = DateTime.UtcNow;

            if (entity.IsActive)
            {
                await DeactivateOtherPromptsAsync(entity.UseCase, entity.Id, cancellationToken);
            }

            await _unitOfWork.Repository<AiPromptTemplate>().Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            return _mapper.Map<AiPromptTemplateDto>(entity);
        }

        public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
        {
            var entity = await GetEntityByIdAsync(id, cancellationToken);
            entity.DeletedBy = _currentUserService.GetUserId();
            entity.DeletedTime = DateTime.UtcNow;
            entity.LastUpdatedBy = _currentUserService.GetUserId();
            entity.LastUpdatedTime = DateTime.UtcNow;
            entity.IsActive = false;

            await _unitOfWork.Repository<AiPromptTemplate>().Update(entity);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
        }

        private async Task<AiPromptTemplate> GetEntityByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var entity = await _unitOfWork.Repository<AiPromptTemplate>().SingleOrDefaultAsync(
                predicate: x => x.Id == id && x.DeletedTime == null,
                cancellationToken: cancellationToken
            );

            if (entity == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    AiErrorMessageConstant.AiPromptNotFound
                );
            }

            return entity;
        }

        private async Task EnsurePromptNameUniquenessAsync(string name, string? excludedId, CancellationToken cancellationToken = default)
        {
            var existing = await _unitOfWork.Repository<AiPromptTemplate>().SingleOrDefaultAsync(
                predicate: x => x.DeletedTime == null && x.Name == name && x.Id != excludedId,
                cancellationToken: cancellationToken
            );

            if (existing != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    AiErrorMessageConstant.AiPromptDuplicateName
                );
            }
        }

        private async Task DeactivateOtherPromptsAsync(Domain.Enums.AiPromptUseCase useCase, string? currentId, CancellationToken cancellationToken = default)
        {
            var existingPrompts = await _unitOfWork.Repository<AiPromptTemplate>().GetListAsync(
                predicate: x => x.DeletedTime == null && x.UseCase == useCase && x.IsActive && x.Id != currentId,
                cancellationToken: cancellationToken
            );

            foreach (var prompt in existingPrompts)
            {
                prompt.IsActive = false;
                prompt.LastUpdatedBy = _currentUserService.GetUserId();
                prompt.LastUpdatedTime = DateTime.UtcNow;
            }

            if (existingPrompts.Count > 0)
            {
                _unitOfWork.Repository<AiPromptTemplate>().UpdateRange(existingPrompts);
            }
        }

        private static System.Linq.Expressions.Expression<Func<AiPromptTemplate, bool>> BuildFilterPredicate(AiPromptTemplateFilterDto filter)
        {
            var normalizedSearch = NormalizeSearch(filter.SearchTerm);
            return x =>
                x.DeletedTime == null &&
                (string.IsNullOrWhiteSpace(normalizedSearch) ||
                 x.Name.Contains(normalizedSearch) ||
                 x.SystemPrompt.Contains(normalizedSearch)) &&
                (!filter.UseCase.HasValue || x.UseCase == filter.UseCase.Value) &&
                (!filter.IsEnabled.HasValue || x.IsEnabled == filter.IsEnabled.Value) &&
                (!filter.IsActive.HasValue || x.IsActive == filter.IsActive.Value);
        }

        private static void Normalize(CreateAiPromptTemplateDto dto)
        {
            dto.Name = dto.Name.Trim();
            dto.SystemPrompt = dto.SystemPrompt.Trim();
            dto.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
            dto.VersionLabel = string.IsNullOrWhiteSpace(dto.VersionLabel) ? null : dto.VersionLabel.Trim();
        }

        private static void Normalize(UpdateAiPromptTemplateDto dto)
        {
            dto.Name = dto.Name.Trim();
            dto.SystemPrompt = dto.SystemPrompt.Trim();
            dto.Description = string.IsNullOrWhiteSpace(dto.Description) ? null : dto.Description.Trim();
            dto.VersionLabel = string.IsNullOrWhiteSpace(dto.VersionLabel) ? null : dto.VersionLabel.Trim();
        }

        private static string? NormalizeSearch(string? searchTerm)
        {
            return string.IsNullOrWhiteSpace(searchTerm) ? null : searchTerm.Trim();
        }
    }
}
