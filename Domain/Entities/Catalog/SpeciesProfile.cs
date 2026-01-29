using Domain.Common;
using Domain.Enums;

namespace Domain.Entities.Catalog
{
    /// <summary>
    /// Contains biological details and descriptive text (Cold Data).
    /// Loaded only on Detail View pages.
    /// 1:1 relationship with Species (Dependent).
    /// Uses Id from BaseEntity as the FK to Species (shared PK/FK pattern).
    /// </summary>
    public class SpeciesProfile : BaseEntity
    {
        public decimal AdultSize { get; set; }
        public decimal BioLoadFactor { get; set; }
        public SwimLevel SwimLevel { get; set; }
        public DietType DietType { get; set; }
        public string? PreferredFood { get; set; }
        public bool IsSchooling { get; set; } = false;
        public int MinGroupSize { get; set; } = 1;
        public string? Origin { get; set; }
        public string? Description { get; set; }

        // Navigation properties
        public Species Species { get; set; } = null!;
    }
}
