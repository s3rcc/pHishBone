using Application.Common;
using Domain.Enums;

namespace Application.DTOs.AiDTOs
{
    public class AiModelConfigDto
    {
        public string Id { get; set; } = string.Empty;
        public string DisplayName { get; set; } = string.Empty;
        public AiProvider Provider { get; set; }
        public string ProviderModelId { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
        public int? MaxOutputTokens { get; set; }
        public decimal? Temperature { get; set; }
        public int TimeoutSeconds { get; set; }
        public string? Description { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime? LastUpdatedTime { get; set; }
    }

    public class AiModelConfigFilterDto : PaginationRequest
    {
        public string? SearchTerm { get; set; }
        public AiProvider? Provider { get; set; }
        public bool? IsEnabled { get; set; }
    }

    public class CreateAiModelConfigDto
    {
        public string DisplayName { get; set; } = string.Empty;
        public AiProvider Provider { get; set; }
        public string ProviderModelId { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public int? MaxOutputTokens { get; set; }
        public decimal? Temperature { get; set; }
        public int TimeoutSeconds { get; set; } = 60;
        public string? Description { get; set; }
    }

    public class UpdateAiModelConfigDto
    {
        public string DisplayName { get; set; } = string.Empty;
        public AiProvider Provider { get; set; }
        public string ProviderModelId { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public int? MaxOutputTokens { get; set; }
        public decimal? Temperature { get; set; }
        public int TimeoutSeconds { get; set; } = 60;
        public string? Description { get; set; }
    }
}
