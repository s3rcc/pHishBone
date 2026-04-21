using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities.Catalog;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Infrastructure.Paginate;
using Infrastructure.Persistence;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System.Text.RegularExpressions;

namespace Infrastructure.Services
{
    public class SpeciesService : ISpeciesService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly ICurrentUserService _currentUserService;
        private readonly IPhotoService _photoService;
        private readonly ApplicationDbContext _dbContext;
        private readonly ILogger<SpeciesService> _logger;
        private readonly ICacheService _cache;

        public SpeciesService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            IPhotoService photoService,
            ApplicationDbContext dbContext,
            ILogger<SpeciesService> logger,
            ICacheService cache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _photoService = photoService;
            _dbContext = dbContext;
            _logger = logger;
            _cache = cache;
        }

        public async Task<SpeciesDto> GetByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            // ── Cache-aside: check cache first ──
            var cacheKey = CacheKeyConstant.SpeciesById + id;
            var cached = await _cache.GetAsync<SpeciesDto>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Species {SpeciesId} served from cache", id);
                return cached;
            }

            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Id == id,
                include: q => q.Include(s => s.Type),
                cancellationToken: cancellationToken
            );

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            var dto = _mapper.Map<SpeciesDto>(species);
            await _cache.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(CacheKeyConstant.DefaultExpiryMinutes), cancellationToken);
            return dto;
        }

        public async Task<SpeciesDetailDto> GetDetailByIdAsync(string id, CancellationToken cancellationToken = default)
        {
            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Id == id,
                include: q => q
                    .Include(s => s.Type)
                    .Include(s => s.SpeciesEnvironment)
                    .Include(s => s.SpeciesProfile)
                    .Include(s => s.SpeciesTags)
                        .ThenInclude(st => st.Tag),
                cancellationToken: cancellationToken
            );

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            return _mapper.Map<SpeciesDetailDto>(species);
        }

        public async Task<SpeciesDetailDto> GetDetailBySlugAsync(string slug, CancellationToken cancellationToken = default)
        {
            // ── Cache-aside by slug ──
            var cacheKey = CacheKeyConstant.SpeciesBySlug + slug;
            var cached = await _cache.GetAsync<SpeciesDetailDto>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Species by slug {Slug} served from cache", slug);
                return cached;
            }

            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Slug == slug,
                include: q => q
                    .Include(s => s.Type)
                    .Include(s => s.SpeciesEnvironment)
                    .Include(s => s.SpeciesProfile)
                    .Include(s => s.SpeciesTags)
                        .ThenInclude(st => st.Tag),
                cancellationToken: cancellationToken
            );

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            var dto = _mapper.Map<SpeciesDetailDto>(species);
            await _cache.SetAsync(cacheKey, dto, TimeSpan.FromMinutes(CacheKeyConstant.DefaultExpiryMinutes), cancellationToken);
            return dto;
        }

        public async Task<ICollection<SpeciesDto>> GetListAsync(CancellationToken cancellationToken = default)
        {
            var species = await _unitOfWork.Repository<Species>().GetListAsync(
                include: q => q.Include(s => s.Type),
                orderBy: q => q.OrderBy(s => s.CommonName),
                cancellationToken: cancellationToken
            );

            return _mapper.Map<ICollection<SpeciesDto>>(species);
        }

        public async Task<PaginationResponse<SpeciesDto>> GetPaginatedListAsync(SpeciesFilterDto filter, CancellationToken cancellationToken = default)
        {
            var query = BuildFilteredQuery(filter);
            query = ApplySortToQuery(query, filter.SortBy, filter.IsAscending);

            var totalCount = await query.CountAsync(cancellationToken);
            var items = await query
                .Skip((filter.Page - 1) * filter.Size)
                .Take(filter.Size)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            return new PaginationResponse<SpeciesDto>
            {
                Size = filter.Size,
                Page = filter.Page,
                Total = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)filter.Size),
                Items = _mapper.Map<IList<SpeciesDto>>(items)
            };
        }

        public async Task<SpeciesDetailDto> CreateAsync(CreateSpeciesDto dto, CancellationToken cancellationToken = default)
        {
            // 1. Validate TypeId exists (only when provided)
            if (!string.IsNullOrWhiteSpace(dto.TypeId))
            {
                var type = await _unitOfWork.Repository<Domain.Entities.Catalog.Type>().SingleOrDefaultAsync(
                    predicate: t => t.Id == dto.TypeId,
                    cancellationToken: cancellationToken
                );
                if (type == null)
                {
                    throw new CustomErrorException(
                        StatusCodes.Status400BadRequest,
                        ErrorCode.NOT_FOUND,
                        CatalogErrorMessageConstant.SpeciesTypeNotFound
                    );
                }
            }

            // 2. Validate all TagIds exist
            if (dto.TagIds.Any())
            {
                var existingTags = await _unitOfWork.Repository<Tag>().GetListAsync(
                    predicate: t => dto.TagIds.Contains(t.Id),
                    cancellationToken: cancellationToken
                );
                if (existingTags.Count != dto.TagIds.Count)
                {
                    throw new CustomErrorException(
                        StatusCodes.Status400BadRequest,
                        ErrorCode.NOT_FOUND,
                        CatalogErrorMessageConstant.SpeciesTagNotFound
                    );
                }
            }

            // 3. Check ScientificName uniqueness (only when provided)
            if (!string.IsNullOrWhiteSpace(dto.ScientificName))
            {
                var existingSpecies = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                    predicate: s => s.ScientificName == dto.ScientificName && s.DeletedTime == null,
                    cancellationToken: cancellationToken
                );
                if (existingSpecies != null)
                {
                    throw new CustomErrorException(
                        StatusCodes.Status400BadRequest,
                        ErrorCode.DUPLICATE,
                        CatalogErrorMessageConstant.SpeciesScientificNameDuplicate
                    );
                }
            }

            // 4. Generate unique slug
            var slug = await GenerateUniqueSlugAsync(dto.CommonName, cancellationToken);

            // 5. Create Species entity
            var species = _mapper.Map<Species>(dto);
            species.Slug = slug;
            species.CreatedBy = _currentUserService.GetUserId();
            _logger.LogInformation("Creating species '{CommonName}', IsActive: {IsActive}", dto.CommonName, dto.IsActive);
            await _unitOfWork.Repository<Species>().InsertAsync(species, cancellationToken);

            // 6. Create SpeciesEnvironment entity with SAME ID
            var environment = _mapper.Map<SpeciesEnvironment>(dto.Environment);
            environment.Id = species.Id; // Critical: Use same ID
            environment.CreatedBy = _currentUserService.GetUserId();
            await _unitOfWork.Repository<SpeciesEnvironment>().InsertAsync(environment, cancellationToken);

            // 7. Create SpeciesProfile entity with SAME ID
            var profile = _mapper.Map<SpeciesProfile>(dto.Profile);
            profile.Id = species.Id; // Critical: Use same ID
            profile.CreatedBy = _currentUserService.GetUserId();
            await _unitOfWork.Repository<SpeciesProfile>().InsertAsync(profile, cancellationToken);

            // 8. Create SpeciesTag entities
            foreach (var tagId in dto.TagIds)
            {
                var speciesTag = new SpeciesTag
                {
                    SpeciesId = species.Id,
                    TagId = tagId,
                    CreatedBy = _currentUserService.GetUserId()
                };
                await _unitOfWork.Repository<SpeciesTag>().InsertAsync(speciesTag, cancellationToken);
            }

            // 9. Save all changes in one transaction
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 10. Invalidate species caches
            await InvalidateSpeciesCachesAsync(cancellationToken);

            // 11. Return full detail
            return await GetDetailByIdAsync(species.Id, cancellationToken);
        }

        public async Task<SpeciesDetailDto> UpdateAsync(string id, UpdateSpeciesDto dto, CancellationToken cancellationToken = default)
        {
            // 1. Fetch existing Species with all includes
            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Id == id,
                include: q => q
                    .Include(s => s.SpeciesEnvironment)
                    .Include(s => s.SpeciesProfile)
                    .Include(s => s.SpeciesTags),
                cancellationToken: cancellationToken
            );

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            // 2. Validate TypeId exists (only when provided)
            if (!string.IsNullOrWhiteSpace(dto.TypeId))
            {
                var type = await _unitOfWork.Repository<Domain.Entities.Catalog.Type>().SingleOrDefaultAsync(
                    predicate: t => t.Id == dto.TypeId,
                    cancellationToken: cancellationToken
                );
                if (type == null)
                {
                    throw new CustomErrorException(
                        StatusCodes.Status400BadRequest,
                        ErrorCode.NOT_FOUND,
                        CatalogErrorMessageConstant.SpeciesTypeNotFound
                    );
                }
            }

            // 3. Validate ScientificName uniqueness — only when provided (exclude current species)
            if (!string.IsNullOrWhiteSpace(dto.ScientificName))
            {
                var existingSpecies = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                    predicate: s => s.ScientificName == dto.ScientificName && s.Id != id && s.DeletedTime == null,
                    cancellationToken: cancellationToken
                );
                if (existingSpecies != null)
                {
                    throw new CustomErrorException(
                        StatusCodes.Status400BadRequest,
                        ErrorCode.DUPLICATE,
                        CatalogErrorMessageConstant.SpeciesScientificNameDuplicate
                    );
                }
            }

            // 4. Update Species properties (preserve Slug!)
            var originalSlug = species.Slug;
            _mapper.Map(dto, species);
            species.Slug = originalSlug; // Immutable slug
            species.LastUpdatedBy = _currentUserService.GetUserId();
            species.LastUpdatedTime = DateTime.UtcNow;
            await _unitOfWork.Repository<Species>().Update(species);

            // 5. Update SpeciesEnvironment
            if (species.SpeciesEnvironment != null)
            {
                _mapper.Map(dto.Environment, species.SpeciesEnvironment);
                species.SpeciesEnvironment.LastUpdatedBy = _currentUserService.GetUserId();
                species.SpeciesEnvironment.LastUpdatedTime = DateTime.UtcNow;
                await _unitOfWork.Repository<SpeciesEnvironment>().Update(species.SpeciesEnvironment);
            }
            else
            {
                // Create if doesn't exist (edge case)
                var environment = _mapper.Map<SpeciesEnvironment>(dto.Environment);
                environment.Id = species.Id;
                environment.CreatedBy = _currentUserService.GetUserId();
                await _unitOfWork.Repository<SpeciesEnvironment>().InsertAsync(environment, cancellationToken);
            }

            // 6. Update SpeciesProfile
            if (species.SpeciesProfile != null)
            {
                _mapper.Map(dto.Profile, species.SpeciesProfile);
                species.SpeciesProfile.LastUpdatedBy = _currentUserService.GetUserId();
                species.SpeciesProfile.LastUpdatedTime = DateTime.UtcNow;
                await _unitOfWork.Repository<SpeciesProfile>().Update(species.SpeciesProfile);
            }
            else
            {
                // Create if doesn't exist (edge case)
                var profile = _mapper.Map<SpeciesProfile>(dto.Profile);
                profile.Id = species.Id;
                profile.CreatedBy = _currentUserService.GetUserId();
                await _unitOfWork.Repository<SpeciesProfile>().InsertAsync(profile, cancellationToken);
            }

            // 7. Smart Tag Sync
            var existingTagIds = species.SpeciesTags.Select(st => st.TagId).ToList();
            var requestedTagIds = dto.TagIds;

            // Tags to remove
            var tagsToRemove = species.SpeciesTags
                .Where(st => !requestedTagIds.Contains(st.TagId))
                .ToList();
            foreach (var tagToRemove in tagsToRemove)
            {
                _unitOfWork.Repository<SpeciesTag>().Delete(tagToRemove);
            }

            // Tags to add
            var tagsToAdd = requestedTagIds
                .Where(tagId => !existingTagIds.Contains(tagId))
                .ToList();
            foreach (var tagId in tagsToAdd)
            {
                // Validate tag exists
                var tagExists = await _unitOfWork.Repository<Tag>().SingleOrDefaultAsync(
                    predicate: t => t.Id == tagId,
                    cancellationToken: cancellationToken
                );
                if (tagExists == null)
                {
                    throw new CustomErrorException(
                        StatusCodes.Status400BadRequest,
                        ErrorCode.NOT_FOUND,
                        CatalogErrorMessageConstant.SpeciesTagNotFound
                    );
                }

                var speciesTag = new SpeciesTag
                {
                    SpeciesId = species.Id,
                    TagId = tagId,
                    CreatedBy = _currentUserService.GetUserId()
                };
                await _unitOfWork.Repository<SpeciesTag>().InsertAsync(speciesTag, cancellationToken);
            }

            // 8. Save all changes in one transaction
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // 9. Invalidate species caches
            await InvalidateSpeciesCachesAsync(cancellationToken);

            // 10. Return full detail
            return await GetDetailByIdAsync(species.Id, cancellationToken);
        }

        public async Task DeleteAsync(string id, CancellationToken cancellationToken = default)
        {
            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Id == id,
                cancellationToken: cancellationToken
            );

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            // Soft delete: Set DeletedTime and DeletedBy
            species.DeletedTime = DateTime.UtcNow;
            species.DeletedBy = _currentUserService.GetUserId();
            await _unitOfWork.Repository<Species>().Update(species);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            // Invalidate species caches
            await InvalidateSpeciesCachesAsync(cancellationToken);
        }

        public async Task<PaginationResponse<SpeciesDto>> SearchHybridAsync(SpeciesFilterDto filter, CancellationToken cancellationToken = default)
        {
            var searchTerm = filter.SearchTerm;
            _logger.LogInformation("Executing hybrid species search for term: {SearchTerm}, Page: {Page}, Size: {Size}", searchTerm, filter.Page, filter.Size);

            // If no search term, fall back to the rich-filter paginated query
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                return await GetPaginatedListAsync(filter, cancellationToken);
            }

            // Step 1: Run the FTS + trigram search to get a relevance-ranked candidate set.
            // [Reasoning] FromSqlInterpolated uses safe parameterized SQL (no string concatenation).
            //   - FTS via websearch_to_tsquery('simple') handles multi-word, bilingual, and scientific names.
            //   - 'simple' dict avoids mangling Vietnamese tokens (unlike 'english' dict).
            //   - Trigram threshold 0.1 catches short typos ("cá ho" → "cá hề").
            //   - Ranking weights FTS match 3x over common-name trigram, scientific 1x.
            var ftsQuery = _dbContext.Species
                .FromSqlInterpolated($@"
                    SELECT * FROM catalog.""Species""
                    WHERE
                        ""FtsVector"" @@ websearch_to_tsquery('simple', {searchTerm})
                        OR similarity(""CommonName"", {searchTerm}) > 0.1
                        OR similarity(""ScientificName"", {searchTerm}) > 0.1
                    ORDER BY
                    (
                        COALESCE(ts_rank(""FtsVector"", websearch_to_tsquery('simple', {searchTerm})), 0) * 3.0
                        + COALESCE(similarity(""CommonName"", {searchTerm}), 0) * 1.5
                        + COALESCE(similarity(""ScientificName"", {searchTerm}), 0)
                    ) DESC");

            // Step 2: Apply all additional filters on top of the FTS result set.
            var filteredQuery = ApplyExtendedFilters(ftsQuery, filter);

            var totalCount = await filteredQuery.CountAsync(cancellationToken);
            var results = await filteredQuery
                .Include(s => s.Type)
                .AsNoTracking()
                .Skip((filter.Page - 1) * filter.Size)
                .Take(filter.Size)
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Hybrid search for '{SearchTerm}' returned {Count} total results", searchTerm, totalCount);

            return new PaginationResponse<SpeciesDto>
            {
                Size = filter.Size,
                Page = filter.Page,
                Total = totalCount,
                TotalPages = (int)Math.Ceiling(totalCount / (double)filter.Size),
                Items = _mapper.Map<IList<SpeciesDto>>(results)
            };
        }

        #region Private Helper Methods

        /// <summary>
        /// Builds the base EF Core query with all cross-table filters applied.
        /// Used by GetPaginatedListAsync for the non-search path.
        /// </summary>
        private IQueryable<Species> BuildFilteredQuery(SpeciesFilterDto filter)
        {
            IQueryable<Species> query = _dbContext.Species
                .Include(s => s.Type)
                .Include(s => s.SpeciesEnvironment)
                .Include(s => s.SpeciesProfile)
                .Include(s => s.SpeciesTags)
                .AsQueryable();

            return ApplyExtendedFilters(query, filter);
        }

        /// <summary>
        /// Applies all non-FTS filters (type, environment, profile, tags) to an arbitrary
        /// Species IQueryable. Shared between BuildFilteredQuery and SearchHybridAsync.
        /// </summary>
        private static IQueryable<Species> ApplyExtendedFilters(IQueryable<Species> query, SpeciesFilterDto filter)
        {
            // ── Species-level filters ────────────────────────────────────────
            if (!string.IsNullOrWhiteSpace(filter.TypeId))
                query = query.Where(s => s.TypeId == filter.TypeId);

            if (filter.IsActive.HasValue)
                query = query.Where(s => s.IsActive == filter.IsActive);

            // ── SpeciesEnvironment filters ────────────────────────────────────
            // pH overlap: species range [PhMin, PhMax] must overlap with filter range [PhMin, PhMax]
            // i.e. species.PhMin <= filter.PhMax AND species.PhMax >= filter.PhMin
            if (filter.PhMin.HasValue)
                query = query.Where(s =>
                    s.SpeciesEnvironment != null &&
                    s.SpeciesEnvironment.PhMax >= filter.PhMin.Value);

            if (filter.PhMax.HasValue)
                query = query.Where(s =>
                    s.SpeciesEnvironment != null &&
                    s.SpeciesEnvironment.PhMin <= filter.PhMax.Value);

            // Temperature overlap (same logic as pH)
            if (filter.TempMin.HasValue)
                query = query.Where(s =>
                    s.SpeciesEnvironment != null &&
                    s.SpeciesEnvironment.TempMax >= filter.TempMin.Value);

            if (filter.TempMax.HasValue)
                query = query.Where(s =>
                    s.SpeciesEnvironment != null &&
                    s.SpeciesEnvironment.TempMin <= filter.TempMax.Value);

            if (filter.WaterType.HasValue)
                query = query.Where(s =>
                    s.SpeciesEnvironment != null &&
                    s.SpeciesEnvironment.WaterType == filter.WaterType.Value);

            // ── SpeciesProfile filters ────────────────────────────────────────
            if (filter.DietType.HasValue)
                query = query.Where(s =>
                    s.SpeciesProfile != null &&
                    s.SpeciesProfile.DietType == filter.DietType.Value);

            if (filter.SwimLevel.HasValue)
                query = query.Where(s =>
                    s.SpeciesProfile != null &&
                    s.SpeciesProfile.SwimLevel == filter.SwimLevel.Value);

            if (!string.IsNullOrWhiteSpace(filter.Origin))
                query = query.Where(s =>
                    s.SpeciesProfile != null &&
                    s.SpeciesProfile.Origin != null &&
                    s.SpeciesProfile.Origin.ToLower().Contains(filter.Origin.ToLower()));

            if (filter.IsSchooling.HasValue)
                query = query.Where(s =>
                    s.SpeciesProfile != null &&
                    s.SpeciesProfile.IsSchooling == filter.IsSchooling.Value);

            if (filter.MaxAdultSize.HasValue)
                query = query.Where(s =>
                    s.SpeciesProfile != null &&
                    s.SpeciesProfile.AdultSize <= filter.MaxAdultSize.Value);

            // ── SpeciesTags filter (species must have ALL specified tags) ──────
            if (filter.TagIds != null && filter.TagIds.Count > 0)
            {
                foreach (var tagId in filter.TagIds)
                {
                    var capturedTagId = tagId; // avoid closure capture
                    query = query.Where(s =>
                        s.SpeciesTags.Any(st => st.TagId == capturedTagId));
                }
            }

            return query;
        }

        /// <summary>
        /// Applies sorting to an arbitrary Species IQueryable.
        /// Supports sorting by top-level Species properties only.
        /// </summary>
        private static IQueryable<Species> ApplySortToQuery(IQueryable<Species> query, string sortBy, bool isAscending)
        {
            return sortBy?.ToLower() switch
            {
                "commonname" => isAscending
                    ? query.OrderBy(s => s.CommonName)
                    : query.OrderByDescending(s => s.CommonName),
                "scientificname" => isAscending
                    ? query.OrderBy(s => s.ScientificName)
                    : query.OrderByDescending(s => s.ScientificName),
                "createdtime" => isAscending
                    ? query.OrderBy(s => s.CreatedTime)
                    : query.OrderByDescending(s => s.CreatedTime),
                _ => query.OrderBy(s => s.CommonName)
            };
        }

        private async Task<string> GenerateUniqueSlugAsync(string commonName, CancellationToken cancellationToken = default)
        {
            // Generate base slug: lowercase, replace spaces with hyphens, remove special chars
            var baseSlug = Regex.Replace(commonName.ToLower().Trim(), @"[^a-z0-9\s-]", "");
            baseSlug = Regex.Replace(baseSlug, @"\s+", "-");
            baseSlug = Regex.Replace(baseSlug, @"-+", "-");
            baseSlug = baseSlug.Trim('-');

            // Check uniqueness
            var slug = baseSlug;
            var counter = 1;

            while (await SlugExistsAsync(slug, cancellationToken))
            {
                slug = $"{baseSlug}-{counter}";
                counter++;
            }

            return slug;
        }

        private async Task<bool> SlugExistsAsync(string slug, CancellationToken cancellationToken = default)
        {
            var existing = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Slug == slug && s.DeletedTime == null,
                cancellationToken: cancellationToken
            );
            return existing != null;
        }

        /// <summary>
        /// Invalidate all species-related cache entries after a mutation.
        /// </summary>
        private async Task InvalidateSpeciesCachesAsync(CancellationToken ct = default)
        {
            _logger.LogInformation("Invalidating all species caches");
            await _cache.RemoveByPrefixAsync(CacheKeyConstant.SpeciesPrefix, ct);
        }

        #endregion
    }
}
