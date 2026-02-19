using Domain.Common;

namespace Domain.Entities.Catalog
{
    /// <summary>
    /// Stores gallery images for a Species.
    /// Images are physically stored on CDN, this table stores URLs and metadata.
    /// </summary>
    public class SpeciesImage : BaseEntity
    {
        /// <summary>
        /// FK to catalog.Species.Id (TEXT).
        /// </summary>
        public string SpeciesId { get; set; } = string.Empty;

        /// <summary>
        /// Full URL to the image on CDN.
        /// </summary>
        public string ImageUrl { get; set; } = string.Empty;

        /// <summary>
        /// Cloudinary public ID for asset management and cleanup.
        /// </summary>
        public string? PublicId { get; set; }

        /// <summary>
        /// Optional description of the image.
        /// </summary>
        public string? Caption { get; set; }

        /// <summary>
        /// For ordering the gallery. Lower numbers appear first.
        /// </summary>
        public int SortOrder { get; set; } = 0;

        // Navigation property
        public Species Species { get; set; } = null!;
    }
}
