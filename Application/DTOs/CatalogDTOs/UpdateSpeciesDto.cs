using Domain.Enums;

namespace Application.DTOs.CatalogDTOs
{
    /// <summary>
    /// Request DTO for updating an existing species.
    /// </summary>
    public class UpdateSpeciesDto
    {
        public string CommonName { get; set; } = string.Empty;
        public string? ScientificName { get; set; }
        public string? TypeId { get; set; }
        public string? ThumbnailUrl { get; set; }
        public bool? IsActive { get; set; }

        public EnvironmentDto Environment { get; set; } = new();
        public ProfileDto Profile { get; set; } = new();
        public List<string> TagIds { get; set; } = new();

        /// <summary>
        /// Nested DTO for environmental parameters.
        /// </summary>
        public class EnvironmentDto
        {
            public decimal PhMin { get; set; }
            public decimal PhMax { get; set; }
            public int TempMin { get; set; }
            public int TempMax { get; set; }
            public int MinTankVolume { get; set; }
            public WaterType WaterType { get; set; }
        }

        /// <summary>
        /// Nested DTO for species profile.
        /// </summary>
        public class ProfileDto
        {
            public decimal AdultSize { get; set; }
            public decimal BioLoadFactor { get; set; }
            public SwimLevel SwimLevel { get; set; }
            public DietType DietType { get; set; }
            public string? PreferredFood { get; set; }
            public bool IsSchooling { get; set; }
            public int MinGroupSize { get; set; }
            public string? Origin { get; set; }
            public string? Description { get; set; }
        }
    }
}
