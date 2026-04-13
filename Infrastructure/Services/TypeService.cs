using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using AutoMapper;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Infrastructure.Paginate;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using CatalogType = Domain.Entities.Catalog.Type;

namespace Infrastructure.Services
{
    public class TypeService : ITypeService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;
        private readonly ILogger<TypeService> _logger;

        public TypeService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICacheService cache,
            ILogger<TypeService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
        }

        public async Task<TypeDto> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            // ── Cache-aside: check cache first ──
            var cacheKey = CacheKeyConstant.TypeById + id;
            var cached = await _cache.GetAsync<TypeDto>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Type {TypeId} served from cache", id);
                return cached;
            }

            var type = await _unitOfWork.Repository<CatalogType>().SingleOrDefaultAsync(
                predicate: t => t.Id == id,
                cancellationToken: cancellationToken
            );

            if (type == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TypeNotFoundMessage
                );
            }

            var dto = _mapper.Map<TypeDto>(type);
            await _cache.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(CacheKeyConstant.DefaultExpiryMinutes), cancellationToken);
            return dto;
        }

        public async Task<ICollection<TypeDto>> GetListAsync(CancellationToken cancellationToken = default)
        {
            // ── Cache-aside: check cache first ──
            var cached = await _cache.GetAsync<ICollection<TypeDto>>(CacheKeyConstant.TypeAll, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Type list served from cache");
                return cached;
            }

            var types = await _unitOfWork.Repository<CatalogType>().GetListAsync(
                orderBy: q => q.OrderBy(t => t.Name),
                cancellationToken: cancellationToken
            );

            var dtos = _mapper.Map<ICollection<TypeDto>>(types);
            await _cache.SetAsync(CacheKeyConstant.TypeAll, dtos, TimeSpan.FromMinutes(CacheKeyConstant.ListExpiryMinutes), cancellationToken);
            return dtos;
        }

        public async Task<PaginationResponse<TypeDto>> GetPaginatedListAsync(TypeFilterDto filter, CancellationToken cancellationToken = default)
        {
            // ── Cache-aside with filter-based key ──
            var cacheKey = $"{CacheKeyConstant.TypePaginated}{filter.Page}:{filter.Size}:{filter.SearchTerm}:{filter.SortBy}:{filter.IsAscending}";
            var cached = await _cache.GetAsync<PaginationResponse<TypeDto>>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Type paginated list served from cache");
                return cached;
            }

            var types = await _unitOfWork.Repository<CatalogType>().GetPagingListAsync(
                predicate: string.IsNullOrWhiteSpace(filter.SearchTerm) ? null :
                    t => t.Name.Contains(filter.SearchTerm),
                page: filter.Page,
                size: filter.Size,
                sortBy: filter.SortBy,
                isAsc: filter.IsAscending,
                cancellationToken: cancellationToken
            );

            var result = new PaginationResponse<TypeDto>
            {
                Size = types.Size,
                Page = types.Page,
                Total = types.Total,
                TotalPages = types.TotalPages,
                Items = _mapper.Map<IList<TypeDto>>(types.Items)
            };

            await _cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(CacheKeyConstant.ListExpiryMinutes), cancellationToken);
            return result;
        }

        public async Task<TypeDto> CreateAsync(CreateTypeDto dto, CancellationToken cancellationToken = default)
        {
            // Check for duplicate name
            var existingWithName = await _unitOfWork.Repository<CatalogType>().SingleOrDefaultAsync(
                predicate: t => t.Name == dto.Name && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );
            if (existingWithName != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TypeNameDuplicate
                );
            }

            var type = _mapper.Map<CatalogType>(dto);
            await _unitOfWork.Repository<CatalogType>().InsertAsync(type, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // ── Invalidate type caches ──
            await InvalidateTypeCachesAsync(cancellationToken);

            return _mapper.Map<TypeDto>(type);
        }

        public async Task<ICollection<TypeDto>> CreateRangeAsync(List<CreateTypeDto> dtos, CancellationToken cancellationToken = default)
        {
            // Check for duplicate names in batch
            var names = dtos.Select(d => d.Name).ToList();
            var existingNames = await _unitOfWork.Repository<CatalogType>().GetListAsync(
                predicate: t => names.Contains(t.Name) && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );

            if (existingNames.Any())
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    $"Types with names already exist: {string.Join(", ", existingNames.Select(t => t.Name))}"
                );
            }

            var types = _mapper.Map<List<CatalogType>>(dtos);
            await _unitOfWork.Repository<CatalogType>().InsertRangeAsync(types, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // ── Invalidate type caches ──
            await InvalidateTypeCachesAsync(cancellationToken);

            return _mapper.Map<ICollection<TypeDto>>(types);
        }

        public async Task<TypeDto> UpdateAsync(string id, UpdateTypeDto dto, CancellationToken cancellationToken = default)
        {
            var type = await _unitOfWork.Repository<CatalogType>().SingleOrDefaultAsync(
                predicate: t => t.Id == id,
                cancellationToken: cancellationToken
            );

            if (type == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TypeNotFoundMessage
                );
            }

            // Check for duplicate name (excluding current type)
            var existingWithName = await _unitOfWork.Repository<CatalogType>().SingleOrDefaultAsync(
                predicate: t => t.Name == dto.Name && t.Id != id && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );
            if (existingWithName != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TypeNameDuplicate
                );
            }

            _mapper.Map(dto, type);
            await _unitOfWork.Repository<CatalogType>().Update(type);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // ── Invalidate type caches ──
            await InvalidateTypeCachesAsync(cancellationToken);

            return _mapper.Map<TypeDto>(type);
        }

        public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
        {
            var type = await _unitOfWork.Repository<CatalogType>().SingleOrDefaultAsync(
                predicate: t => t.Id == id,
                cancellationToken: cancellationToken
            );

            if (type == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TypeNotFoundMessage
                );
            }

            _unitOfWork.Repository<CatalogType>().Delete(type);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // ── Invalidate type caches ──
            await InvalidateTypeCachesAsync(cancellationToken);
        }

        /// <summary>
        /// Invalidate all type-related cache entries after a mutation.
        /// </summary>
        private async Task InvalidateTypeCachesAsync(CancellationToken ct = default)
        {
            _logger.LogInformation("Invalidating all type caches");
            await _cache.RemoveByPrefixAsync(CacheKeyConstant.TypePrefix, ct);
        }
    }
}
