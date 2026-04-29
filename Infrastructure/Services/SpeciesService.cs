using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using Application.DTOs.ImageDTOs;
using Application.DTOs.PBUserDTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Entities.Catalog;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Infrastructure.Paginate;
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
        private readonly ILogger<SpeciesService> _logger;
        private readonly ICacheService _cache;

        public SpeciesService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            IPhotoService photoService,
            ILogger<SpeciesService> logger,
            ICacheService cache)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _photoService = photoService;
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
            var species = await BuildSpeciesDetailDtoQuery()
                .SingleOrDefaultAsync(s => s.Id == id, cancellationToken);

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            return species;
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

            var species = await BuildSpeciesDetailDtoQuery()
                .SingleOrDefaultAsync(s => s.Slug == slug, cancellationToken);

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            await _cache.SetAsync(cacheKey, species, TimeSpan.FromMinutes(CacheKeyConstant.DefaultExpiryMinutes), cancellationToken);
            return species;
        }

        public async Task<SpeciesDetailPageDto> GetDetailPageBySlugAsync(string slug, RelatedSpeciesFilterDto filter, CancellationToken cancellationToken = default)
        {
            var species = await GetDetailBySlugAsync(slug, cancellationToken);
            var images = await GetSpeciesImagesForDetailAsync(species.Id, cancellationToken);
            var bookmarkStatus = await TryGetBookmarkStatusAsync(species.Id, cancellationToken);
            var relatedSpecies = filter.IncludeRelated
                ? await GetRelatedAsync(species.Id, filter, cancellationToken)
                : new List<RelatedSpeciesDto>();

            return new SpeciesDetailPageDto
            {
                Species = species,
                Images = images,
                RelatedSpecies = relatedSpecies,
                BookmarkStatus = bookmarkStatus
            };
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
            var ftsQuery = _unitOfWork.Repository<Species>().FromSqlInterpolated($@"
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

        public async Task<ICollection<RelatedSpeciesDto>> GetRelatedAsync(string id, RelatedSpeciesFilterDto filter, CancellationToken cancellationToken = default)
        {
            var sourceSpecies = await BuildSpeciesDetailQuery()
                .SingleOrDefaultAsync(s => s.Id == id, cancellationToken);

            if (sourceSpecies == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            return await GetRelatedAsync(sourceSpecies, filter, cancellationToken);
        }

        #region Private Helper Methods

        private async Task<List<RelatedSpeciesDto>> GetRelatedAsync(Species sourceSpecies, RelatedSpeciesFilterDto filter, CancellationToken cancellationToken)
        {
            var requestedSize = filter.Size <= 0
                ? SpeciesRecommendationConstant.DefaultSize
                : Math.Min(filter.Size, SpeciesRecommendationConstant.MaxSize);
            var excludedIds = BuildExcludedSpeciesIds(sourceSpecies.Id, filter);
            var relatedPool = await GetOrBuildRelatedSpeciesPoolAsync(sourceSpecies, requestedSize, cancellationToken);

            return SelectDiversifiedCandidates(relatedPool, excludedIds, requestedSize, filter.Seed);
        }

        private async Task<List<RelatedSpeciesDto>> GetOrBuildRelatedSpeciesPoolAsync(
            Species sourceSpecies,
            int requestedSize,
            CancellationToken cancellationToken)
        {
            var cacheKey = CacheKeyConstant.SpeciesRelated + sourceSpecies.Id;
            var cachedPool = await _cache.GetAsync<List<RelatedSpeciesDto>>(cacheKey, cancellationToken);
            if (cachedPool != null)
            {
                _logger.LogInformation("Related species for {SpeciesId} served from cache", sourceSpecies.Id);
                return cachedPool;
            }

            _logger.LogInformation(
                "Generating related species pool for {SpeciesId} with requested size {RequestedSize}",
                sourceSpecies.Id,
                requestedSize);

            var relatedPool = await BuildRelatedSpeciesPoolAsync(sourceSpecies, cancellationToken);
            await _cache.SetAsync(
                cacheKey,
                relatedPool,
                TimeSpan.FromMinutes(CacheKeyConstant.DefaultExpiryMinutes),
                cancellationToken);

            return relatedPool;
        }

        /// <summary>
        /// Builds the base EF Core query with all cross-table filters applied.
        /// Used by GetPaginatedListAsync for the non-search path.
        /// </summary>
        private IQueryable<Species> BuildFilteredQuery(SpeciesFilterDto filter)
        {
            IQueryable<Species> query = _unitOfWork.Repository<Species>()
                .GetQueryable()
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

        private async Task<List<RelatedSpeciesDto>> BuildRelatedSpeciesPoolAsync(Species sourceSpecies, CancellationToken cancellationToken)
        {
            var candidates = await BuildSpeciesDetailQuery()
                .Where(s =>
                    s.Id != sourceSpecies.Id &&
                    s.DeletedTime == null &&
                    s.IsActive == true)
                .ToListAsync(cancellationToken);

            _logger.LogInformation(
                "Scoring {CandidateCount} related species candidates for {SpeciesId}",
                candidates.Count,
                sourceSpecies.Id);

            return candidates
                .Select(candidate => BuildRelatedSpeciesDto(sourceSpecies, candidate))
                .OrderByDescending(candidate => candidate.Score)
                .ThenBy(candidate => candidate.CommonName)
                .Take(SpeciesRecommendationConstant.PoolSize)
                .ToList();
        }

        private IQueryable<SpeciesDetailDto> BuildSpeciesDetailDtoQuery()
        {
            return _unitOfWork.Repository<Species>()
                .GetQueryable()
                .Where(species => species.DeletedTime == null)
                .Select(species => new SpeciesDetailDto
                {
                    Id = species.Id,
                    TypeId = species.TypeId,
                    TypeName = species.Type != null ? species.Type.Name : null,
                    ScientificName = species.ScientificName,
                    CommonName = species.CommonName,
                    ThumbnailUrl = species.ThumbnailUrl,
                    Slug = species.Slug,
                    IsActive = species.IsActive,
                    CreatedTime = species.CreatedTime,
                    LastUpdatedTime = species.LastUpdatedTime,
                    Environment = species.SpeciesEnvironment == null
                        ? null
                        : new SpeciesEnvironmentDto
                        {
                            PhMin = species.SpeciesEnvironment.PhMin,
                            PhMax = species.SpeciesEnvironment.PhMax,
                            TempMin = species.SpeciesEnvironment.TempMin,
                            TempMax = species.SpeciesEnvironment.TempMax,
                            MinTankVolume = species.SpeciesEnvironment.MinTankVolume,
                            WaterType = species.SpeciesEnvironment.WaterType
                        },
                    Profile = species.SpeciesProfile == null
                        ? null
                        : new SpeciesProfileDto
                        {
                            AdultSize = species.SpeciesProfile.AdultSize,
                            BioLoadFactor = species.SpeciesProfile.BioLoadFactor,
                            SwimLevel = species.SpeciesProfile.SwimLevel,
                            DietType = species.SpeciesProfile.DietType,
                            PreferredFood = species.SpeciesProfile.PreferredFood,
                            IsSchooling = species.SpeciesProfile.IsSchooling,
                            MinGroupSize = species.SpeciesProfile.MinGroupSize,
                            Origin = species.SpeciesProfile.Origin,
                            Description = species.SpeciesProfile.Description
                        },
                    Tags = species.SpeciesTags
                        .Select(speciesTag => new TagDto
                        {
                            Id = speciesTag.Tag.Id,
                            Code = speciesTag.Tag.Code,
                            Name = speciesTag.Tag.Name,
                            Description = speciesTag.Tag.Description,
                            CreatedTime = speciesTag.Tag.CreatedTime
                        })
                        .ToList()
                });
        }

        private async Task<List<ImageResponseDto>> GetSpeciesImagesForDetailAsync(string speciesId, CancellationToken cancellationToken)
        {
            var cacheKey = CacheKeyConstant.SpeciesImages + speciesId;
            var cached = await _cache.GetAsync<List<ImageResponseDto>>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Species images for {SpeciesId} served from cache", speciesId);
                return cached;
            }

            var images = await _unitOfWork.Repository<SpeciesImage>()
                .GetQueryable()
                .Where(image => image.SpeciesId == speciesId && image.DeletedTime == null)
                .OrderBy(image => image.SortOrder)
                .ThenByDescending(image => image.CreatedTime)
                .Select(image => new ImageResponseDto(
                    image.Id,
                    image.ImageUrl,
                    image.PublicId,
                    image.Caption,
                    image.SortOrder,
                    image.CreatedTime))
                .ToListAsync(cancellationToken);

            await _cache.SetAsync(cacheKey, images, TimeSpan.FromMinutes(CacheKeyConstant.DefaultExpiryMinutes), cancellationToken);
            return images;
        }

        private IQueryable<Species> BuildSpeciesDetailQuery(bool includeImages = false)
        {
            IQueryable<Species> query = _unitOfWork.Repository<Species>()
                .GetQueryable()
                .AsSplitQuery()
                .Include(s => s.Type)
                .Include(s => s.SpeciesEnvironment)
                .Include(s => s.SpeciesProfile)
                .Include(s => s.SpeciesTags)
                    .ThenInclude(st => st.Tag);

            if (includeImages)
            {
                query = query.Include(s => s.SpeciesImages);
            }

            return query;
        }

        private static HashSet<string> BuildExcludedSpeciesIds(string sourceSpeciesId, RelatedSpeciesFilterDto filter)
        {
            var excludedIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase)
            {
                sourceSpeciesId
            };

            foreach (var excludedId in ExpandDelimitedIdentifiers(filter.ExcludeIds))
            {
                excludedIds.Add(excludedId);
            }

            foreach (var recentlyViewedId in ExpandDelimitedIdentifiers(filter.RecentlyViewedIds))
            {
                excludedIds.Add(recentlyViewedId);
            }

            return excludedIds;
        }

        private static IEnumerable<string> ExpandDelimitedIdentifiers(IEnumerable<string>? identifiers)
        {
            if (identifiers == null)
            {
                yield break;
            }

            foreach (var identifier in identifiers)
            {
                if (string.IsNullOrWhiteSpace(identifier))
                {
                    continue;
                }

                foreach (var value in identifier.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries))
                {
                    yield return value;
                }
            }
        }

        private static List<RelatedSpeciesDto> SelectDiversifiedCandidates(
            IEnumerable<RelatedSpeciesDto> candidates,
            HashSet<string> excludedIds,
            int requestedSize,
            string? seed)
        {
            var filteredCandidates = candidates
                .Where(candidate => !excludedIds.Contains(candidate.Id))
                .OrderByDescending(candidate => candidate.Score + ComputeSeededJitter(seed, candidate.Id))
                .ThenBy(candidate => candidate.CommonName)
                .ToList();

            if (filteredCandidates.Count <= requestedSize)
            {
                return filteredCandidates;
            }

            var selected = new List<RelatedSpeciesDto>(requestedSize);
            var selectedIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);
            var typeCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            var primaryReasonCounts = new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);
            var maxSameType = Math.Max(2, (int)Math.Ceiling(requestedSize / 2d));
            var maxSamePrimaryReason = Math.Max(2, (int)Math.Ceiling(requestedSize / 2d));

            foreach (var candidate in filteredCandidates)
            {
                if (selected.Count >= requestedSize)
                {
                    break;
                }

                var typeKey = candidate.TypeId?.Trim();
                var primaryReason = candidate.MatchReasons.FirstOrDefault()?.Trim();
                var exceedsTypeCap =
                    !string.IsNullOrWhiteSpace(typeKey) &&
                    typeCounts.TryGetValue(typeKey, out var typeCount) &&
                    typeCount >= maxSameType;
                var exceedsReasonCap =
                    !string.IsNullOrWhiteSpace(primaryReason) &&
                    primaryReasonCounts.TryGetValue(primaryReason, out var reasonCount) &&
                    reasonCount >= maxSamePrimaryReason;

                if (exceedsTypeCap || exceedsReasonCap)
                {
                    continue;
                }

                selected.Add(candidate);
                selectedIds.Add(candidate.Id);

                if (!string.IsNullOrWhiteSpace(typeKey))
                {
                    typeCounts[typeKey] = typeCounts.TryGetValue(typeKey, out var count) ? count + 1 : 1;
                }

                if (!string.IsNullOrWhiteSpace(primaryReason))
                {
                    primaryReasonCounts[primaryReason] = primaryReasonCounts.TryGetValue(primaryReason, out var count) ? count + 1 : 1;
                }
            }

            if (selected.Count < requestedSize)
            {
                foreach (var candidate in filteredCandidates)
                {
                    if (selected.Count >= requestedSize)
                    {
                        break;
                    }

                    if (selectedIds.Add(candidate.Id))
                    {
                        selected.Add(candidate);
                    }
                }
            }

            return selected;
        }

        private static decimal ComputeSeededJitter(string? seed, string candidateId)
        {
            if (string.IsNullOrWhiteSpace(seed))
            {
                return 0m;
            }

            var hash = (uint)HashCode.Combine(seed.Trim().ToLowerInvariant(), candidateId);
            return (hash % 1000) / 100000m;
        }

        private RelatedSpeciesDto BuildRelatedSpeciesDto(Species sourceSpecies, Species candidate)
        {
            const decimal sameTypeWeight = 20m;
            const decimal sharedTagsWeight = 25m;
            const decimal sameWaterTypeWeight = 10m;
            const decimal phOverlapWeight = 10m;
            const decimal tempOverlapWeight = 10m;
            const decimal swimLevelWeight = 10m;
            const decimal dietWeight = 5m;
            const decimal adultSizeWeight = 5m;
            const decimal schoolingWeight = 5m;

            var sourceTagIds = sourceSpecies.SpeciesTags.Select(st => st.TagId).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var candidateTagIds = candidate.SpeciesTags.Select(st => st.TagId).ToHashSet(StringComparer.OrdinalIgnoreCase);
            var scoreBreakdown = new List<(string Reason, decimal Score)>();

            if (!string.IsNullOrWhiteSpace(sourceSpecies.TypeId) && sourceSpecies.TypeId == candidate.TypeId)
            {
                scoreBreakdown.Add((SpeciesRecommendationConstant.SameTypeReason, sameTypeWeight));
            }

            var tagSimilarity = CalculateJaccardSimilarity(sourceTagIds, candidateTagIds);
            if (tagSimilarity > 0m)
            {
                scoreBreakdown.Add((SpeciesRecommendationConstant.SharedTagsReason, Math.Round(tagSimilarity * sharedTagsWeight, 2)));
            }

            if (sourceSpecies.SpeciesEnvironment != null && candidate.SpeciesEnvironment != null)
            {
                if (sourceSpecies.SpeciesEnvironment.WaterType == candidate.SpeciesEnvironment.WaterType)
                {
                    scoreBreakdown.Add((SpeciesRecommendationConstant.SameWaterTypeReason, sameWaterTypeWeight));
                }

                var phOverlap = CalculateRangeOverlap(
                    sourceSpecies.SpeciesEnvironment.PhMin,
                    sourceSpecies.SpeciesEnvironment.PhMax,
                    candidate.SpeciesEnvironment.PhMin,
                    candidate.SpeciesEnvironment.PhMax);
                if (phOverlap > 0m)
                {
                    scoreBreakdown.Add((SpeciesRecommendationConstant.SimilarPhRangeReason, Math.Round(phOverlap * phOverlapWeight, 2)));
                }

                var tempOverlap = CalculateRangeOverlap(
                    sourceSpecies.SpeciesEnvironment.TempMin,
                    sourceSpecies.SpeciesEnvironment.TempMax,
                    candidate.SpeciesEnvironment.TempMin,
                    candidate.SpeciesEnvironment.TempMax);
                if (tempOverlap > 0m)
                {
                    scoreBreakdown.Add((SpeciesRecommendationConstant.SimilarTemperatureRangeReason, Math.Round(tempOverlap * tempOverlapWeight, 2)));
                }
            }

            if (sourceSpecies.SpeciesProfile != null && candidate.SpeciesProfile != null)
            {
                if (sourceSpecies.SpeciesProfile.SwimLevel == candidate.SpeciesProfile.SwimLevel)
                {
                    scoreBreakdown.Add((SpeciesRecommendationConstant.SameSwimLevelReason, swimLevelWeight));
                }

                if (sourceSpecies.SpeciesProfile.DietType == candidate.SpeciesProfile.DietType)
                {
                    scoreBreakdown.Add((SpeciesRecommendationConstant.SameDietReason, dietWeight));
                }

                var adultSizeSimilarity = CalculateScalarSimilarity(
                    sourceSpecies.SpeciesProfile.AdultSize,
                    candidate.SpeciesProfile.AdultSize);
                if (adultSizeSimilarity > 0.6m)
                {
                    scoreBreakdown.Add((SpeciesRecommendationConstant.SimilarAdultSizeReason, Math.Round(adultSizeSimilarity * adultSizeWeight, 2)));
                }

                if (sourceSpecies.SpeciesProfile.IsSchooling && candidate.SpeciesProfile.IsSchooling)
                {
                    scoreBreakdown.Add((SpeciesRecommendationConstant.SchoolingBehaviorReason, schoolingWeight));
                }
            }

            var matchReasons = scoreBreakdown
                .OrderByDescending(item => item.Score)
                .Select(item => item.Reason)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .Take(3)
                .ToList();

            if (matchReasons.Count == 0)
            {
                matchReasons.Add(SpeciesRecommendationConstant.FallbackReason);
            }

            return new RelatedSpeciesDto
            {
                Id = candidate.Id,
                TypeId = candidate.TypeId,
                TypeName = candidate.Type?.Name,
                ScientificName = candidate.ScientificName,
                CommonName = candidate.CommonName,
                ThumbnailUrl = candidate.ThumbnailUrl,
                Slug = candidate.Slug,
                IsActive = candidate.IsActive,
                CreatedTime = candidate.CreatedTime,
                Score = Math.Round(scoreBreakdown.Sum(item => item.Score), 2),
                MatchReasons = matchReasons
            };
        }

        private static decimal CalculateJaccardSimilarity(HashSet<string> sourceIds, HashSet<string> candidateIds)
        {
            if (sourceIds.Count == 0 || candidateIds.Count == 0)
            {
                return 0m;
            }

            var intersection = sourceIds.Intersect(candidateIds, StringComparer.OrdinalIgnoreCase).Count();
            if (intersection == 0)
            {
                return 0m;
            }

            var union = sourceIds.Union(candidateIds, StringComparer.OrdinalIgnoreCase).Count();
            return union == 0 ? 0m : intersection / (decimal)union;
        }

        private static decimal CalculateRangeOverlap(decimal sourceMin, decimal sourceMax, decimal candidateMin, decimal candidateMax)
        {
            var overlapMin = Math.Max(sourceMin, candidateMin);
            var overlapMax = Math.Min(sourceMax, candidateMax);
            if (overlapMax <= overlapMin)
            {
                return 0m;
            }

            var sourceRange = sourceMax - sourceMin;
            var candidateRange = candidateMax - candidateMin;
            var largestRange = Math.Max(sourceRange, candidateRange);

            if (largestRange <= 0m)
            {
                return 0m;
            }

            return (overlapMax - overlapMin) / largestRange;
        }

        private static decimal CalculateScalarSimilarity(decimal sourceValue, decimal candidateValue)
        {
            var largestValue = Math.Max(sourceValue, candidateValue);
            if (largestValue <= 0m)
            {
                return 0m;
            }

            var delta = Math.Abs(sourceValue - candidateValue);
            return 1m - Math.Min(delta / largestValue, 1m);
        }

        private async Task<SpeciesBookmarkStatusDto?> TryGetBookmarkStatusAsync(string speciesId, CancellationToken cancellationToken)
        {
            if (!_currentUserService.IsAuthenticated())
            {
                return null;
            }

            var userSupabaseId = _currentUserService.GetUserId();
            if (string.IsNullOrWhiteSpace(userSupabaseId))
            {
                return null;
            }

            var cacheKey = $"{CacheKeyConstant.SpeciesBookmarksPrefix}{userSupabaseId}:{CacheKeyConstant.SpeciesBookmarkStatus}{speciesId}";
            var cached = await _cache.GetAsync<SpeciesBookmarkStatusDto>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Species bookmark status served from cache. UserSupabaseId: {UserSupabaseId}, SpeciesId: {SpeciesId}", userSupabaseId, speciesId);
                return cached;
            }

            var bookmarkSnapshot = await _unitOfWork.Repository<PBUser>()
                .GetQueryable()
                .Where(user => user.SupabaseUserId == userSupabaseId && user.DeletedTime == null)
                .Select(user => new
                {
                    BookmarkedTime = user.SpeciesBookmarks
                        .Where(bookmark =>
                            bookmark.SpeciesId == speciesId &&
                            bookmark.DeletedTime == null &&
                            bookmark.Species.DeletedTime == null &&
                            bookmark.Species.IsActive == true)
                        .Select(bookmark => (DateTime?)bookmark.CreatedTime)
                        .SingleOrDefault()
                })
                .SingleOrDefaultAsync(cancellationToken);

            if (bookmarkSnapshot == null)
            {
                return null;
            }

            var status = new SpeciesBookmarkStatusDto
            {
                SpeciesId = speciesId,
                IsBookmarked = bookmarkSnapshot.BookmarkedTime.HasValue,
                BookmarkedTime = bookmarkSnapshot.BookmarkedTime
            };

            await _cache.SetAsync(
                cacheKey,
                status,
                TimeSpan.FromMinutes(CacheKeyConstant.DefaultExpiryMinutes),
                cancellationToken);

            return status;
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
