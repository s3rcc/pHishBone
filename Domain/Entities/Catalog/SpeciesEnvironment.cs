using Domain.Common;
using Domain.Enums;

namespace Domain.Entities.Catalog
{
    /// <summary>
    /// Contains numeric data strictly for the Compatibility & Physics Algorithms.
    /// Loaded into RAM during calculation (Calculation Engine Data).
    /// 1:1 relationship with Species (Dependent).
    /// Uses Id from BaseEntity as the FK to Species (shared PK/FK pattern).
    /// </summary>
    public class SpeciesEnvironment : BaseEntity
    {
        public decimal PhMin { get; set; }
        public decimal PhMax { get; set; }
        public int TempMin { get; set; }
        public int TempMax { get; set; }
        public int MinTankVolume { get; set; }
        public WaterType WaterType { get; set; }

        // Navigation properties
        public Species Species { get; set; } = null!;
    }
}
