namespace Application.DTOs.CatalogDTOs
{
    public class TagDto
    {
        public string Id { get; set; } = string.Empty;
        public string Code { get; set; } = string.Empty;
        public string Name { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime CreatedTime { get; set; }
    }
}
