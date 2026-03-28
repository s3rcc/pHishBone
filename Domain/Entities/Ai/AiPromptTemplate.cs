using Domain.Common;
using Domain.Enums;

namespace Domain.Entities.Ai
{
    /// <summary>
    /// Managed AI prompt template stored in the database.
    /// </summary>
    public class AiPromptTemplate : BaseEntity
    {
        public string Name { get; set; } = string.Empty;
        public AiPromptUseCase UseCase { get; set; }
        public string SystemPrompt { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public bool IsActive { get; set; }
        public string? Description { get; set; }
        public string? VersionLabel { get; set; }
    }
}
