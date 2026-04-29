using Application.DTOs.ImageDTOs;
using Application.DTOs.PBUserDTOs;

namespace Application.DTOs.CatalogDTOs
{
    /// <summary>
    /// Aggregated payload for the public species detail page.
    /// </summary>
    public class SpeciesDetailPageDto
    {
        public SpeciesDetailDto Species { get; set; } = new();
        public ICollection<ImageResponseDto> Images { get; set; } = new List<ImageResponseDto>();
        public ICollection<RelatedSpeciesDto> RelatedSpecies { get; set; } = new List<RelatedSpeciesDto>();
        public SpeciesBookmarkStatusDto? BookmarkStatus { get; set; }
    }
}
