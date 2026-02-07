using Domain.Common;

namespace Domain.Entities.Project
{
    /// <summary>
    /// Stores gallery images for a Tank.
    /// Images are physically stored on CDN, this table stores URLs and metadata.
    /// </summary>
    public class TankImage : BaseEntity
    {
        /// <summary>
        /// FK to project.Tanks.Id.
        /// </summary>
        public string TankId { get; set; } = string.Empty;

        /// <summary>
        /// Full URL to the image on CDN.
        /// </summary>
        public string ImageUrl { get; set; } = string.Empty;

        /// <summary>
        /// Optional description of the image.
        /// </summary>
        public string? Caption { get; set; }

        /// <summary>
        /// For ordering the gallery. Lower numbers appear first.
        /// </summary>
        public int SortOrder { get; set; } = 0;

        // Navigation property
        public Tank Tank { get; set; } = null!;
    }
}
