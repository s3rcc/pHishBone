namespace Application.DTOs.CatalogDTOs
{
    /// <summary>
    /// Basic Species DTO for list views containing only hot data.
    /// </summary>
    public class SpeciesDto
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
    }
}
