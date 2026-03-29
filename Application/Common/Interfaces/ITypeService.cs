using Application.Common;
using Application.DTOs.CatalogDTOs;

namespace Application.Common.Interfaces
{
    public interface ITypeService
    {
        Task<TypeDto> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<ICollection<TypeDto>> GetListAsync(CancellationToken cancellationToken = default);
        Task<PaginationResponse<TypeDto>> GetPaginatedListAsync(TypeFilterDto filter, CancellationToken cancellationToken = default);
        Task<TypeDto> CreateAsync(CreateTypeDto dto, CancellationToken cancellationToken = default);
        Task<ICollection<TypeDto>> CreateRangeAsync(List<CreateTypeDto> dtos, CancellationToken cancellationToken = default);
        Task<TypeDto> UpdateAsync(string id, UpdateTypeDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    }
}
