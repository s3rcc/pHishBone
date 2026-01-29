using Application.Common;

namespace Application.DTOs.CatalogDTOs
{
    public class TagFilterDto : PaginationRequest
    {
        public string? SearchTerm { get; set; }
    }
}
