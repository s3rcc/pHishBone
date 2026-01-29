using Domain.Common;

namespace Domain.Entities.Catalog
{
    /// <summary>
    /// Many-to-Many mapping table between Species and Tags.
    /// Inherits BaseEntity for Id, CreatedTime, etc.
    /// Composite unique index on (SpeciesId, TagId).
    /// </summary>
    public class SpeciesTag : BaseEntity
    {
        public string SpeciesId { get; set; } = string.Empty;
        public string TagId { get; set; } = string.Empty;

        // Navigation properties
        public Species Species { get; set; } = null!;
        public Tag Tag { get; set; } = null!;
    }
}
