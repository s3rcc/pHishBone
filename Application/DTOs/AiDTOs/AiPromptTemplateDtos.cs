using Application.Common;
using Domain.Enums;

namespace Application.DTOs.AiDTOs
{
    public class AiPromptTemplateDto
    {
        public string Id { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public AiPromptUseCase UseCase { get; set; }
        public string SystemPrompt { get; set; } = string.Empty;
        public bool IsEnabled { get; set; }
        public bool IsActive { get; set; }
        public string? Description { get; set; }
        public string? VersionLabel { get; set; }
        public DateTime CreatedTime { get; set; }
        public DateTime? LastUpdatedTime { get; set; }
    }

    public class AiPromptTemplateFilterDto : PaginationRequest
    {
        public string? SearchTerm { get; set; }
        public AiPromptUseCase? UseCase { get; set; }
        public bool? IsEnabled { get; set; }
        public bool? IsActive { get; set; }
    }

    public class CreateAiPromptTemplateDto
    {
        public string Name { get; set; } = string.Empty;
        public AiPromptUseCase UseCase { get; set; }
        public string SystemPrompt { get; set; } = string.Empty;
        public bool IsEnabled { get; set; } = true;
        public bool IsActive { get; set; }
        public string? Description { get; set; }
        public string? VersionLabel { get; set; }
    }

    public class UpdateAiPromptTemplateDto
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
