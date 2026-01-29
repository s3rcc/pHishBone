using Application.Common;

namespace Application.DTOs.CatalogDTOs
{
    public class TypeFilterDto : PaginationRequest
    {
        public string? SearchTerm { get; set; }
    }
}
