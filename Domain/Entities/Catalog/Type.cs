using Domain.Common;

namespace Domain.Entities.Catalog
{
    /// <summary>
    /// Defines the biological category (Fish, Plant, Invertebrate, etc.).
    /// Lookup table for catalog types.
    /// </summary>
    public class Type : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Navigation properties
        public ICollection<Species> Species { get; set; } = new List<Species>();
    }
}
