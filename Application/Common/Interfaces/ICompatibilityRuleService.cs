using Application.Common;
using Application.DTOs.CatalogDTOs;

namespace Application.Common.Interfaces
{
    public interface ICompatibilityRuleService
    {
        Task<CompatibilityRuleDto> GetByIdAsync(string id);
        Task<PaginationResponse<CompatibilityRuleDto>> GetPaginatedListAsync(CompatibilityRuleFilterDto filter);
        Task<CompatibilityRuleDto> CreateAsync(CreateCompatibilityRuleDto dto);
        Task<CompatibilityRuleDto> UpdateAsync(string id, UpdateCompatibilityRuleDto dto);
        Task DeleteAsync(string id);
    }
}
