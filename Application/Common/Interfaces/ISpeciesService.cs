using Application.Common;
using Application.DTOs.CatalogDTOs;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Service interface for Species CRUD operations.
    /// Handles complex multi-table transactions for Species, SpeciesEnvironment, SpeciesProfile, and SpeciesTags.
    /// </summary>
    public interface ISpeciesService
    {
        /// <summary>
        /// Get basic species information by ID (lightweight, no includes).
        /// </summary>
        Task<SpeciesDto> GetByIdAsync(string id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Get full species details by ID including Environment, Profile, and Tags.
        /// </summary>
        Task<SpeciesDetailDto> GetDetailByIdAsync(string id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Get full species details by slug for public catalog SEO-friendly URLs.
        /// </summary>
        Task<SpeciesDetailDto> GetDetailBySlugAsync(string slug, CancellationToken cancellationToken = default);

        /// <summary>
        /// Get all species as a basic list.
        /// </summary>
        Task<ICollection<SpeciesDto>> GetListAsync(CancellationToken cancellationToken = default);

        /// <summary>
        /// Get paginated species list with filtering and search.
        /// </summary>
        Task<PaginationResponse<SpeciesDto>> GetPaginatedListAsync(SpeciesFilterDto filter, CancellationToken cancellationToken = default);

        /// <summary>
        /// Create a new species with environment, profile, and tags.
        /// Uses transaction to ensure atomicity across multiple tables.
        /// </summary>
        Task<SpeciesDetailDto> CreateAsync(CreateSpeciesDto dto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Update an existing species with environment, profile, and tags.
        /// Uses transaction and smart tag synchronization.
        /// Slug is immutable and will be preserved.
        /// </summary>
        Task<SpeciesDetailDto> UpdateAsync(string id, UpdateSpeciesDto dto, CancellationToken cancellationToken = default);

        /// <summary>
        /// Soft delete a species by setting DeletedTime and DeletedBy.
        /// Physical deletion is not allowed to preserve historical data.
        /// </summary>
        Task DeleteAsync(string id, CancellationToken cancellationToken = default);

        /// <summary>
        /// Performs a bilingual hybrid search combining FTS (simple dictionary) and Trigram similarity.
        /// Handles exact matches, Vietnamese text, scientific names, and typos in a single query.
        /// Returns paginated results ranked by relevance (FTS score weighted 2x over trigram).
        /// </summary>
        Task<PaginationResponse<SpeciesDto>> SearchHybridAsync(SpeciesFilterDto filter, CancellationToken cancellationToken = default);
    }
}
