using Domain.Enums;

namespace Application.DTOs.CatalogDTOs
{
    public class SpeciesEnvironmentDto
    {
        public decimal PhMin { get; set; }
        public decimal PhMax { get; set; }
        public int TempMin { get; set; }
        public int TempMax { get; set; }
        public int MinTankVolume { get; set; }
        public WaterType WaterType { get; set; }
    }
}
