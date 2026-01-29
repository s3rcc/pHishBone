using Application.Common;
using Application.DTOs.CatalogDTOs;

namespace Application.Common.Interfaces
{
    public interface ITypeService
    {
        Task<TypeDto> GetByIdAsync(string id);
        Task<ICollection<TypeDto>> GetListAsync();
        Task<PaginationResponse<TypeDto>> GetPaginatedListAsync(TypeFilterDto filter);
        Task<TypeDto> CreateAsync(CreateTypeDto dto);
        Task<ICollection<TypeDto>> CreateRangeAsync(List<CreateTypeDto> dtos);
        Task<TypeDto> UpdateAsync(string id, UpdateTypeDto dto);
        Task DeleteAsync(string id);
    }
}
