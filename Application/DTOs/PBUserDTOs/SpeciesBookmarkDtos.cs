using Application.Common;
using Application.DTOs.CatalogDTOs;

namespace Application.DTOs.PBUserDTOs
{
    /// <summary>
    /// Filter for listing the authenticated user's bookmarked species.
    /// </summary>
    public class SpeciesBookmarkFilterDto : PaginationRequest
    {
        public string? SearchTerm { get; set; }

        public SpeciesBookmarkFilterDto()
        {
            SortBy = nameof(BookmarkedSpeciesDto.BookmarkedTime);
            IsAscending = false;
            Size = 12;
        }
    }

    /// <summary>
    /// Lightweight bookmarked species card for user favorites management.
    /// </summary>
    public class BookmarkedSpeciesDto : SpeciesDto
    {
        public DateTime BookmarkedTime { get; set; }
    }

    /// <summary>
    /// Bookmark status for a specific species in the authenticated user's collection.
    /// </summary>
    public class SpeciesBookmarkStatusDto
    {
        public string SpeciesId { get; set; } = string.Empty;
        public bool IsBookmarked { get; set; }
        public DateTime? BookmarkedTime { get; set; }
    }
}
