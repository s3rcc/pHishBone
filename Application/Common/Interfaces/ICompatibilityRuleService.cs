using Application.Common;
using Application.DTOs.CatalogDTOs;

namespace Application.Common.Interfaces
{
    public interface ICompatibilityRuleService
    {
        Task<CompatibilityRuleDto> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<PaginationResponse<CompatibilityRuleDto>> GetPaginatedListAsync(CompatibilityRuleFilterDto filter, CancellationToken cancellationToken = default);
        Task<CompatibilityRuleDto> CreateAsync(CreateCompatibilityRuleDto dto, CancellationToken cancellationToken = default);
        Task<CompatibilityRuleDto> UpdateAsync(string id, UpdateCompatibilityRuleDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    }
}
