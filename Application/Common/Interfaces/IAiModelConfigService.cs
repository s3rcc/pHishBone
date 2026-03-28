using Application.Common;
using Application.DTOs.AiDTOs;

namespace Application.Common.Interfaces
{
    public interface IAiModelConfigService
    {
        Task<AiModelConfigDto> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<ICollection<AiModelConfigDto>> GetListAsync(CancellationToken cancellationToken = default);
        Task<PaginationResponse<AiModelConfigDto>> GetPaginatedListAsync(AiModelConfigFilterDto filter, CancellationToken cancellationToken = default);
        Task<ICollection<AiModelConfigDto>> GetAvailableAsync(CancellationToken cancellationToken = default);
        Task<AiModelConfigDto> CreateAsync(CreateAiModelConfigDto dto, CancellationToken cancellationToken = default);
        Task<AiModelConfigDto> UpdateAsync(string id, UpdateAiModelConfigDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    }
}
