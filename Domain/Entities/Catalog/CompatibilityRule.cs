using Domain.Common;
using Domain.Enums;

namespace Domain.Entities.Catalog
{
    /// <summary>
    /// Defines compatibility logic between tags.
    /// Used by the compatibility engine to determine if species can coexist.
    /// </summary>
    public class CompatibilityRule : BaseEntity
    {
        public string SubjectTagId { get; set; } = string.Empty;
        public string ObjectTagId { get; set; } = string.Empty;
        public Severity Severity { get; set; }
        public string Message { get; set; } = string.Empty;

        // Navigation properties
        public Tag SubjectTag { get; set; } = null!;
        public Tag ObjectTag { get; set; } = null!;
    }
}
