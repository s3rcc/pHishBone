using System.ComponentModel.DataAnnotations;

using Domain.Common;

namespace Domain.Entities.Catalog
{
    /// <summary>
    /// Defines behavioral traits used for the Rule Engine.
    /// </summary>
    public class Tag : BaseEntity
    {
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }

        // Navigation properties
        public ICollection<SpeciesTag> SpeciesTags { get; set; } = new List<SpeciesTag>();
        public ICollection<CompatibilityRule> SubjectRules { get; set; } = new List<CompatibilityRule>();
        public ICollection<CompatibilityRule> ObjectRules { get; set; } = new List<CompatibilityRule>();
    }
}
