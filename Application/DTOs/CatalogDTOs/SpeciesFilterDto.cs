namespace Application.DTOs.CatalogDTOs
{
    /// <summary>
    /// Filter DTO for species pagination and search.
    /// </summary>
    public class SpeciesFilterDto
    {
        public int Page { get; set; } = 1;
        public int Size { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string? TypeId { get; set; }
        public string SortBy { get; set; } = "CommonName";
        public bool IsAscending { get; set; } = true;
        public bool? IsActive { get; set; }
    }
}
