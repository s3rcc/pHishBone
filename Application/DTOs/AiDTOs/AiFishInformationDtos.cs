using Application.DTOs.CatalogDTOs;

namespace Application.DTOs.AiDTOs
{
    public class GenerateFishInformationRequestDto
    {
        public string FishName { get; set; } = string.Empty;
        public string ModelConfigId { get; set; } = string.Empty;
    }

    public class AiGenerationIssueDto
    {
        public string Field { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public string? AttemptedValue { get; set; }
    }

    public class AiGeneratedSpeciesDraftDto
    {
        public string CommonName { get; set; } = string.Empty;
        public string ScientificName { get; set; } = string.Empty;
        public string TypeId { get; set; } = string.Empty;
        public string TypeName { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public EnvironmentDraftDto Environment { get; set; } = new();
        public ProfileDraftDto Profile { get; set; } = new();
        public List<string> TagIds { get; set; } = new();
        public List<string> TagCodes { get; set; } = new();

        public class EnvironmentDraftDto
        {
            public decimal PhMin { get; set; }
            public decimal PhMax { get; set; }
            public int TempMin { get; set; }
            public int TempMax { get; set; }
            public int MinTankVolume { get; set; }
            public int WaterType { get; set; }
            public string WaterTypeName { get; set; } = string.Empty;
        }

        public class ProfileDraftDto
        {
            public decimal AdultSize { get; set; }
            public decimal BioLoadFactor { get; set; }
            public int SwimLevel { get; set; }
            public string SwimLevelName { get; set; } = string.Empty;
            public int DietType { get; set; }
            public string DietTypeName { get; set; } = string.Empty;
            public string? PreferredFood { get; set; }
            public bool IsSchooling { get; set; }
            public int MinGroupSize { get; set; }
            public string? Origin { get; set; }
            public string? Description { get; set; }
        }
    }

    public class AiFishInformationResponseDto
    {
        public string Source { get; set; } = string.Empty;
        public bool IsReadyForCreate { get; set; }
        public string ModelConfigId { get; set; } = string.Empty;
        public string? PromptTemplateId { get; set; }
        public SpeciesDetailDto? ExistingSpecies { get; set; }
        public AiGeneratedSpeciesDraftDto? GeneratedDraft { get; set; }
        public List<AiGenerationIssueDto> Issues { get; set; } = new();
    }
}
