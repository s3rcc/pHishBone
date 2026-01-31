using Domain.Common;

namespace Domain.Entities.Project
{
    /// <summary>
    /// Stores frozen calculation results for compatibility checks.
    /// Optimized for read-heavy operations (newsfeed display).
    /// </summary>
    public class TankSnapshot : BaseEntity
    {
        public string TankId { get; set; } = string.Empty; // FK to Tank.Id
        
        public int SafetyScore { get; set; } // 0 to 100 (100 = Perfect)
        public int FilterCapacity { get; set; } // Percentage of filtration (e.g., 120%)
        
        /// <summary>
        /// List of issues/warnings stored as JSON.
        /// Example: ["Betta eats Neon", "Temp too high"]
        /// </summary>
        public List<string> Warnings { get; set; } = new List<string>();

        // Navigation property
        public Tank Tank { get; set; } = null!;
    }
}
