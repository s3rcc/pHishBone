using Domain.Common;

namespace Domain.Entities.Catalog
{
    /// <summary>
    /// The core identity table for catalog items.
    /// Contains only data required for list views, searching, and auto-completion (Hot Data).
    /// </summary>
    public class Species : BaseEntity
    {
        public string TypeId { get; set; } = string.Empty;
        public string ScientificName { get; set; } = string.Empty;
        public string CommonName { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public string Slug { get; set; } = string.Empty;

        // Navigation properties
        public Type Type { get; set; } = null!;
        public SpeciesEnvironment? SpeciesEnvironment { get; set; }
        public SpeciesProfile? SpeciesProfile { get; set; }
        public ICollection<SpeciesTag> SpeciesTags { get; set; } = new List<SpeciesTag>();
    }
}
