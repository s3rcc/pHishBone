using Domain.Common;
using Domain.Enums;

namespace Domain.Entities.Ai
{
    /// <summary>
    /// Managed model configuration stored in the database.
    /// </summary>
    public class AiModelConfig : BaseEntity
    {
        public string DisplayName { get; set; } = string.Empty;
        public AiProvider Provider { get; set; }
        public string ProviderModelId { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public bool IsDefault { get; set; } = false;
        public int? MaxOutputTokens { get; set; }
        public decimal? Temperature { get; set; }
        public int TimeoutSeconds { get; set; } = 60;
        public string? Description { get; set; }
    }
}
