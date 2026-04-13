using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using AutoMapper;
using Domain.Entities.Catalog;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Infrastructure.Paginate;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    public class TagService : ITagService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICacheService _cache;
        private readonly ILogger<TagService> _logger;

        public TagService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICacheService cache,
            ILogger<TagService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _cache = cache;
            _logger = logger;
        }

        public async Task<TagDto> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            // ── Cache-aside: check cache first ──
            var cacheKey = CacheKeyConstant.TagById + id;
            var cached = await _cache.GetAsync<TagDto>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Tag {TagId} served from cache", id);
                return cached;
            }

            var tag = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Id == id,
                cancellationToken: cancellationToken
            );

            if (tag == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TagNotFoundMessage
                );
            }

            var dto = _mapper.Map<TagDto>(tag);
            await _cache.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(CacheKeyConstant.DefaultExpiryMinutes), cancellationToken);
            return dto;
        }

        public async Task<ICollection<TagDto>> GetListAsync(CancellationToken cancellationToken = default)
        {
            // ── Cache-aside: check cache first ──
            var cached = await _cache.GetAsync<ICollection<TagDto>>(CacheKeyConstant.TagAll, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Tag list served from cache");
                return cached;
            }

            var tags = await _unitOfWork.Repository<Tag>().GetListAsync(
                orderBy: q => q.OrderBy(t => t.Name),
                cancellationToken: cancellationToken
            );

            var dtos = _mapper.Map<ICollection<TagDto>>(tags);
            await _cache.SetAsync(CacheKeyConstant.TagAll, dtos, TimeSpan.FromMinutes(CacheKeyConstant.ListExpiryMinutes), cancellationToken);
            return dtos;
        }

        public async Task<PaginationResponse<TagDto>> GetPaginatedListAsync(TagFilterDto filter, CancellationToken cancellationToken = default)
        {
            // ── Cache-aside with filter-based key ──
            var cacheKey = $"{CacheKeyConstant.TagPaginated}{filter.Page}:{filter.Size}:{filter.SearchTerm}:{filter.SortBy}:{filter.IsAscending}";
            var cached = await _cache.GetAsync<PaginationResponse<TagDto>>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Tag paginated list served from cache");
                return cached;
            }

            var tags = await _unitOfWork.Repository<Tag>().GetPagingListAsync(
                predicate: string.IsNullOrWhiteSpace(filter.SearchTerm) ? null :
                    t => t.Code.Contains(filter.SearchTerm) || t.Name.Contains(filter.SearchTerm),
                page: filter.Page,
                size: filter.Size,
                sortBy: filter.SortBy,
                isAsc: filter.IsAscending,
                cancellationToken: cancellationToken
            );

            var result = new PaginationResponse<TagDto>
            {
                Size = tags.Size,
                Page = tags.Page,
                Total = tags.Total,
                TotalPages = tags.TotalPages,
                Items = _mapper.Map<IList<TagDto>>(tags.Items)
            };

            await _cache.SetAsync(cacheKey, result, TimeSpan.FromMinutes(CacheKeyConstant.ListExpiryMinutes), cancellationToken);
            return result;
        }

        // ─── Code Normalizer ──────────────────────────────────────────────
        /// <summary>
        /// Normalises a raw tag code input into SCREAMING_SNAKE_CASE.
        /// "high light" → "HIGH_LIGHT", "easy-care!" → "EASY_CARE"
        /// Rules:
        ///   1. Trim surrounding whitespace.
        ///   2. Replace any run of non-alphanumeric-ASCII characters with '_'.
        ///   3. Uppercase.
        ///   4. Strip leading / trailing underscores.
        ///   5. Collapse consecutive underscores into one.
        /// Throws if the result is empty or does not match ^[A-Z][A-Z0-9_]*$.
        /// </summary>
        private static string NormalizeCode(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw))
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.VALIDATION_ERROR,
                    CatalogErrorMessageConstant.TagCodeRequired);

            // Replace any char that is not A-Z / a-z / 0-9 with '_'
            var replaced = System.Text.RegularExpressions.Regex.Replace(raw.Trim(), @"[^A-Za-z0-9]+", "_");

            // Uppercase, strip leading/trailing underscores, collapse doubles
            var normalized = System.Text.RegularExpressions.Regex.Replace(
                replaced.Trim('_').ToUpperInvariant(), @"_+", "_");

            if (string.IsNullOrEmpty(normalized))
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.VALIDATION_ERROR,
                    CatalogErrorMessageConstant.TagCodeInvalidFormat);

            // Ensure it starts with a letter
            if (!char.IsLetter(normalized[0]))
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.VALIDATION_ERROR,
                    CatalogErrorMessageConstant.TagCodeMustStartWithLetter);

            return normalized;
        }

        public async Task<TagDto> CreateAsync(CreateTagDto dto, CancellationToken cancellationToken = default)
        {
            // Normalize code before any validation or persistence
            dto.Code = NormalizeCode(dto.Code);

            // Check for duplicate code
            var existingWithCode = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Code == dto.Code && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );
            if (existingWithCode != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TagCodeDuplicate
                );
            }

            // Check for duplicate name
            var existingWithName = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Name == dto.Name && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );
            if (existingWithName != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TagNameDuplicate
                );
            }

            var tag = _mapper.Map<Tag>(dto);
            await _unitOfWork.Repository<Tag>().InsertAsync(tag, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // ── Invalidate tag caches ──
            await InvalidateTagCachesAsync(cancellationToken);

            return _mapper.Map<TagDto>(tag);
        }

        public async Task<ICollection<TagDto>> CreateRangeAsync(List<CreateTagDto> dtos, CancellationToken cancellationToken = default)
        {
            // Normalize all codes first
            foreach (var dto in dtos)
                dto.Code = NormalizeCode(dto.Code);

            // Check for duplicate codes in batch
            var codes = dtos.Select(d => d.Code).ToList();
            var existingCodes = await _unitOfWork.Repository<Tag>().GetListAsync(
                predicate: t => codes.Contains(t.Code) && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );

            if (existingCodes.Any())
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    $"Tags with codes already exist: {string.Join(", ", existingCodes.Select(t => t.Code))}"
                );
            }

            // Check for duplicate names in batch
            var names = dtos.Select(d => d.Name).ToList();
            var existingNames = await _unitOfWork.Repository<Tag>().GetListAsync(
                predicate: t => names.Contains(t.Name) && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );

            if (existingNames.Any())
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    $"Tags with names already exist: {string.Join(", ", existingNames.Select(t => t.Name))}"
                );
            }

            var tags = _mapper.Map<List<Tag>>(dtos);
            await _unitOfWork.Repository<Tag>().InsertRangeAsync(tags, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // ── Invalidate tag caches ──
            await InvalidateTagCachesAsync(cancellationToken);

            return _mapper.Map<ICollection<TagDto>>(tags);
        }

        public async Task<TagDto> UpdateAsync(string id, UpdateTagDto dto, CancellationToken cancellationToken = default)
        {
            // Normalize code before any checks
            dto.Code = NormalizeCode(dto.Code);

            var tag = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Id == id,
                cancellationToken: cancellationToken
            );

            if (tag == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TagNotFoundMessage
                );
            }

            // Check for duplicate code (excluding current tag)
            var existingWithCode = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Code == dto.Code && t.Id != id && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );
            if (existingWithCode != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TagCodeDuplicate
                );
            }

            // Check for duplicate name (excluding current tag)
            var existingWithName = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Name == dto.Name && t.Id != id && t.DeletedTime == null,
                cancellationToken: cancellationToken
            );
            if (existingWithName != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.TagNameDuplicate
                );
            }

            _mapper.Map(dto, tag);
            await _unitOfWork.Repository<Tag>().Update(tag);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // ── Invalidate tag caches ──
            await InvalidateTagCachesAsync(cancellationToken);

            return _mapper.Map<TagDto>(tag);
        }

        public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
        {
            var tag = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                predicate: t => t.Id == id,
                cancellationToken: cancellationToken
            );

            if (tag == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.TagNotFoundMessage
                );
            }

            _unitOfWork.Repository<Tag>().Delete(tag);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // ── Invalidate tag caches ──
            await InvalidateTagCachesAsync(cancellationToken);
        }

        /// <summary>
        /// Invalidate all tag-related cache entries after a mutation.
        /// </summary>
        private async Task InvalidateTagCachesAsync(CancellationToken ct = default)
        {
            _logger.LogInformation("Invalidating all tag caches");
            await _cache.RemoveByPrefixAsync(CacheKeyConstant.TagPrefix, ct);
        }
    }
}
