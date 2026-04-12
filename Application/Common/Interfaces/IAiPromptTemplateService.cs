using Application.Common;
using Application.DTOs.AiDTOs;

namespace Application.Common.Interfaces
{
    public interface IAiPromptTemplateService
    {
        Task<AiPromptTemplateDto> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<ICollection<AiPromptTemplateDto>> GetListAsync(CancellationToken cancellationToken = default);
        Task<PaginationResponse<AiPromptTemplateDto>> GetPaginatedListAsync(AiPromptTemplateFilterDto filter, CancellationToken cancellationToken = default);
        Task<AiPromptTemplateDto> CreateAsync(CreateAiPromptTemplateDto dto, CancellationToken cancellationToken = default);
        Task<AiPromptTemplateDto> UpdateAsync(string id, UpdateAiPromptTemplateDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    }
}
