using Domain.Common;
using Domain.Enums;

namespace Domain.Entities.Project
{
    /// <summary>
    /// Stores what is inside the tank (Fish, Plants, Equipment).
    /// </summary>
    public class TankItem : BaseEntity
    {
        public string TankId { get; set; } = string.Empty; // FK to Tank.Id
        public ItemType ItemType { get; set; }
        
        /// <summary>
        /// Cross-schema reference to catalog.Species.Id or catalog.Products.Id
        /// (no navigation property - loose coupling).
        /// </summary>
        public string ReferenceId { get; set; } = string.Empty;
        
        public int Quantity { get; set; } = 1;
        public string? Note { get; set; }

        // Navigation property
        public Tank Tank { get; set; } = null!;
    }
}
