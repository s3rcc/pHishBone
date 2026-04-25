namespace Application.DTOs.CatalogDTOs
{
    /// <summary>
    /// Full Species detail DTO with all nested data for detail views.
    /// </summary>
    public class SpeciesDetailDto
    {
        public string Id { get; set; } = string.Empty;
        public string? TypeId { get; set; }
        public string? TypeName { get; set; }
        public string? ScientificName { get; set; }
        public string CommonName { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string Slug { get; set; } = string.Empty;
        public bool? IsActive { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime? LastUpdatedTime { get; set; }

        // Nested related data
        public SpeciesEnvironmentDto? Environment { get; set; }
        public SpeciesProfileDto? Profile { get; set; }
        public ICollection<TagDto> Tags { get; set; } = new List<TagDto>();
    }
}
