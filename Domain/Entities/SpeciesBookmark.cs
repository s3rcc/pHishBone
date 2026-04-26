using Domain.Common;
using Domain.Entities.Catalog;

namespace Domain.Entities
{
    /// <summary>
    /// Stores a user's bookmarked species for quick access and favorites management.
    /// </summary>
    public class SpeciesBookmark : BaseEntity
    {
        public string UserId { get; set; } = string.Empty;
        public string SpeciesId { get; set; } = string.Empty;

        public PBUser User { get; set; } = null!;
        public Species Species { get; set; } = null!;
    }
}
