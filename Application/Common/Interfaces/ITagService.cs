using Application.Common;
using Application.DTOs.CatalogDTOs;

namespace Application.Common.Interfaces
{
    public interface ITagService
    {
        Task<TagDto> GetByIdAsync(string id, CancellationToken cancellationToken = default);
        Task<ICollection<TagDto>> GetListAsync(CancellationToken cancellationToken = default);
        Task<PaginationResponse<TagDto>> GetPaginatedListAsync(TagFilterDto filter, CancellationToken cancellationToken = default);
        Task<TagDto> CreateAsync(CreateTagDto dto, CancellationToken cancellationToken = default);
        Task<ICollection<TagDto>> CreateRangeAsync(List<CreateTagDto> dtos, CancellationToken cancellationToken = default);
        Task<TagDto> UpdateAsync(string id, UpdateTagDto dto, CancellationToken cancellationToken = default);
        Task DeleteAsync(string id, CancellationToken cancellationToken = default);
    }
}
