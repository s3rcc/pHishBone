using Domain.Enums;

namespace Application.DTOs.CatalogDTOs
{
    public class SpeciesProfileDto
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
