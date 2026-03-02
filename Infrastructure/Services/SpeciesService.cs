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

        public SpeciesService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            ICurrentUserService currentUserService,
            IPhotoService photoService,
            ApplicationDbContext dbContext,
            ILogger<SpeciesService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _currentUserService = currentUserService;
            _photoService = photoService;
            _dbContext = dbContext;
            _logger = logger;
        }

        public async Task<SpeciesDto> GetByIdAsync(string id)
        {
            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Id == id,
                include: q => q.Include(s => s.Type)
            );

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            return _mapper.Map<SpeciesDto>(species);
        }

        public async Task<SpeciesDetailDto> GetDetailByIdAsync(string id)
        {
            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Id == id,
                include: q => q
                    .Include(s => s.Type)
                    .Include(s => s.SpeciesEnvironment)
                    .Include(s => s.SpeciesProfile)
                    .Include(s => s.SpeciesTags)
                        .ThenInclude(st => st.Tag)
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

        public async Task<ICollection<SpeciesDto>> GetListAsync()
        {
            var species = await _unitOfWork.Repository<Species>().GetListAsync(
                include: q => q.Include(s => s.Type),
                orderBy: q => q.OrderBy(s => s.CommonName)
            );

            return _mapper.Map<ICollection<SpeciesDto>>(species);
        }

        public async Task<PaginationResponse<SpeciesDto>> GetPaginatedListAsync(SpeciesFilterDto filter)
        {
            var species = await _unitOfWork.Repository<Species>().GetPagingListAsync(
                predicate: BuildFilterPredicate(filter),
                include: q => q.Include(s => s.Type),
                page: filter.Page,
                size: filter.Size,
                sortBy: filter.SortBy,
                isAsc: filter.IsAscending
            );

            return new PaginationResponse<SpeciesDto>
            {
                Size = species.Size,
                Page = species.Page,
                Total = species.Total,
                TotalPages = species.TotalPages,
                Items = _mapper.Map<IList<SpeciesDto>>(species.Items)
            };
        }

        public async Task<SpeciesDetailDto> CreateAsync(CreateSpeciesDto dto)
        {
            // 1. Validate TypeId exists
            var type = await _unitOfWork.Repository<Domain.Entities.Catalog.Type>().SingleOrDefaultAsync(
                predicate: t => t.Id == dto.TypeId
            );
            if (type == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesTypeNotFound
                );
            }

            // 2. Validate all TagIds exist
            if (dto.TagIds.Any())
            {
                var existingTags = await _unitOfWork.Repository<Tag>().GetListAsync(
                    predicate: t => dto.TagIds.Contains(t.Id)
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

            // 3. Check ScientificName uniqueness
            var existingSpecies = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.ScientificName == dto.ScientificName
            );
            if (existingSpecies != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.SpeciesScientificNameDuplicate
                );
            }

            // 4. Generate unique slug
            var slug = await GenerateUniqueSlugAsync(dto.CommonName);

            // 5. Create Species entity
            var species = _mapper.Map<Species>(dto);
            species.Slug = slug;
            species.CreatedBy = _currentUserService.GetUserId();
            await _unitOfWork.Repository<Species>().InsertAsync(species);

            // 6. Create SpeciesEnvironment entity with SAME ID
            var environment = _mapper.Map<SpeciesEnvironment>(dto.Environment);
            environment.Id = species.Id; // Critical: Use same ID
            environment.CreatedBy = _currentUserService.GetUserId();
            await _unitOfWork.Repository<SpeciesEnvironment>().InsertAsync(environment);

            // 7. Create SpeciesProfile entity with SAME ID
            var profile = _mapper.Map<SpeciesProfile>(dto.Profile);
            profile.Id = species.Id; // Critical: Use same ID
            profile.CreatedBy = _currentUserService.GetUserId();
            await _unitOfWork.Repository<SpeciesProfile>().InsertAsync(profile);

            // 8. Create SpeciesTag entities
            foreach (var tagId in dto.TagIds)
            {
                var speciesTag = new SpeciesTag
                {
                    SpeciesId = species.Id,
                    TagId = tagId,
                    CreatedBy = _currentUserService.GetUserId()
                };
                await _unitOfWork.Repository<SpeciesTag>().InsertAsync(speciesTag);
            }

            // 9. Save all changes in one transaction
            await _unitOfWork.SaveChangesAsync();

            // 10. Return full detail
            return await GetDetailByIdAsync(species.Id);
        }

        public async Task<SpeciesDetailDto> UpdateAsync(string id, UpdateSpeciesDto dto)
        {
            // 1. Fetch existing Species with all includes
            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Id == id,
                include: q => q
                    .Include(s => s.SpeciesEnvironment)
                    .Include(s => s.SpeciesProfile)
                    .Include(s => s.SpeciesTags)
            );

            if (species == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound
                );
            }

            // 2. Validate TypeId exists
            var type = await _unitOfWork.Repository<Domain.Entities.Catalog.Type>().SingleOrDefaultAsync(
                predicate: t => t.Id == dto.TypeId
            );
            if (type == null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesTypeNotFound
                );
            }

            // 3. Validate ScientificName uniqueness (exclude current species)
            var existingSpecies = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.ScientificName == dto.ScientificName && s.Id != id
            );
            if (existingSpecies != null)
            {
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    CatalogErrorMessageConstant.SpeciesScientificNameDuplicate
                );
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
                await _unitOfWork.Repository<SpeciesEnvironment>().InsertAsync(environment);
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
                await _unitOfWork.Repository<SpeciesProfile>().InsertAsync(profile);
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
                    predicate: t => t.Id == tagId
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
                await _unitOfWork.Repository<SpeciesTag>().InsertAsync(speciesTag);
            }

            // 8. Save all changes in one transaction
            await _unitOfWork.SaveChangesAsync();

            // 9. Return full detail
            return await GetDetailByIdAsync(species.Id);
        }

        public async Task DeleteAsync(string id)
        {
            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Id == id
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
            await _unitOfWork.SaveChangesAsync();
        }

        public async Task<List<SpeciesDto>> SearchHybridAsync(string searchTerm, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Executing hybrid species search for term: {SearchTerm}", searchTerm);

            // If no search term, return top 20 ordered by name as a sensible default
            if (string.IsNullOrWhiteSpace(searchTerm))
            {
                var defaultResults = await _unitOfWork.Repository<Species>().GetListAsync(
                    orderBy: q => q.OrderBy(s => s.CommonName),
                    include: q => q.Include(s => s.Type)
                );
                return _mapper.Map<List<SpeciesDto>>(defaultResults.Take(20).ToList());
            }

            // [Reasoning] FromSqlInterpolated is used for safe, parameterized raw SQL.
            // EF Core converts {searchTerm} interpolation holes into $1/$2 SQL parameters — NOT string concatenation.
            // Logic:
            //   1. FTS match via websearch_to_tsquery('simple') — handles multi-word, bilingual, scientific names.
            //      'simple' dict is used instead of 'english' to avoid mangling Vietnamese words.
            //   2. Trigram similarity > 0.15 — deliberately low to catch short typos (e.g. "cá ho" → "cá hề").
            //      Default PG threshold (0.3) is too strict for short Vietnamese tokens.
            //   3. Ranking: FTS rank * 2.0 ensures exact word matches always outrank fuzzy trigram matches.
            var results = await _dbContext.Species
                .FromSqlInterpolated($@"
                    SELECT * FROM catalog.""Species""
                    WHERE 
                        ""FtsVector"" @@ websearch_to_tsquery('simple', {searchTerm})
                        OR similarity(""CommonName"", {searchTerm}) > 0.15
                        OR similarity(""ScientificName"", {searchTerm}) > 0.15
                    ORDER BY 
                    (
                        COALESCE(ts_rank(""FtsVector"", websearch_to_tsquery('simple', {searchTerm})), 0) * 2.0
                        + COALESCE(similarity(""CommonName"", {searchTerm}), 0)
                    ) DESC
                    LIMIT 20")
                .Include(s => s.Type)
                .AsNoTracking()
                .ToListAsync(cancellationToken);

            _logger.LogInformation("Hybrid search for '{SearchTerm}' returned {Count} results", searchTerm, results.Count);
            return _mapper.Map<List<SpeciesDto>>(results);
        }

        #region Private Helper Methods

        private System.Linq.Expressions.Expression<Func<Species, bool>>? BuildFilterPredicate(SpeciesFilterDto filter)
        {
            if (string.IsNullOrWhiteSpace(filter.SearchTerm) && string.IsNullOrWhiteSpace(filter.TypeId))
            {
                return null;
            }

            return s =>
                (string.IsNullOrWhiteSpace(filter.SearchTerm) ||
                 s.CommonName.Contains(filter.SearchTerm) ||
                 s.ScientificName.Contains(filter.SearchTerm)) &&
                (string.IsNullOrWhiteSpace(filter.TypeId) || s.TypeId == filter.TypeId);
        }

        private async Task<string> GenerateUniqueSlugAsync(string commonName)
        {
            // Generate base slug: lowercase, replace spaces with hyphens, remove special chars
            var baseSlug = Regex.Replace(commonName.ToLower().Trim(), @"[^a-z0-9\s-]", "");
            baseSlug = Regex.Replace(baseSlug, @"\s+", "-");
            baseSlug = Regex.Replace(baseSlug, @"-+", "-");
            baseSlug = baseSlug.Trim('-');

            // Check uniqueness
            var slug = baseSlug;
            var counter = 1;

            while (await SlugExistsAsync(slug))
            {
                slug = $"{baseSlug}-{counter}";
                counter++;
            }

            return slug;
        }

        private async Task<bool> SlugExistsAsync(string slug)
        {
            var existing = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: s => s.Slug == slug
            );
            return existing != null;
        }

        #endregion
    }
}
