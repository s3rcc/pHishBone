using Application.Common;
using Application.DTOs.PBUserDTOs;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Service interface for managing the authenticated user's species bookmarks.
    /// </summary>
    public interface ISpeciesBookmarkService
    {
        Task<BookmarkedSpeciesDto> AddAsync(string userSupabaseId, string speciesId, CancellationToken cancellationToken = default);
        Task RemoveAsync(string userSupabaseId, string speciesId, CancellationToken cancellationToken = default);
        Task<PaginationResponse<BookmarkedSpeciesDto>> GetPaginatedAsync(string userSupabaseId, SpeciesBookmarkFilterDto filter, CancellationToken cancellationToken = default);
        Task<SpeciesBookmarkStatusDto> GetStatusAsync(string userSupabaseId, string speciesId, CancellationToken cancellationToken = default);
    }
}
