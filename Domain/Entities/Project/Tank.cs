using Domain.Common;
using Domain.Enums;

namespace Domain.Entities.Project
{
    /// <summary>
    /// Represents a user's aquarium project (the aggregate root).
    /// </summary>
    public class Tank : BaseEntity
    {
        public string UserId { get; set; } = string.Empty; // FK to PBUser.Id (local user)
        public string Name { get; set; } = string.Empty;
        
        // Dimensions in cm
        public int Width { get; set; }
        public int Height { get; set; }
        public int Depth { get; set; }
        
        // Calculated volume in liters
        public int WaterVolume { get; set; }
        
        public WaterType WaterType { get; set; }
        public TankStatus Status { get; set; } = TankStatus.Draft;

        // Navigation properties (same schema relationships)
        public ICollection<TankItem> TankItems { get; set; } = new List<TankItem>();
        public ICollection<TankSnapshot> TankSnapshots { get; set; } = new List<TankSnapshot>();
    }
}
