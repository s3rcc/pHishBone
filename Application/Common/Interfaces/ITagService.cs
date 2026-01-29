using Application.Common;
using Application.DTOs.CatalogDTOs;

namespace Application.Common.Interfaces
{
    public interface ITagService
    {
        Task<TagDto> GetByIdAsync(string id);
        Task<ICollection<TagDto>> GetListAsync();
        Task<PaginationResponse<TagDto>> GetPaginatedListAsync(TagFilterDto filter);
        Task<TagDto> CreateAsync(CreateTagDto dto);
        Task<ICollection<TagDto>> CreateRangeAsync(List<CreateTagDto> dtos);
        Task<TagDto> UpdateAsync(string id, UpdateTagDto dto);
        Task DeleteAsync(string id);
    }
}
