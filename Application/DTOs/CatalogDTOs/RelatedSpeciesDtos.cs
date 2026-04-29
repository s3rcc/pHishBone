namespace Application.DTOs.CatalogDTOs
{
    /// <summary>
    /// Query options for fetching related species from a species detail context.
    /// </summary>
    public class RelatedSpeciesFilterDto
    {
        public bool IncludeRelated { get; set; } = false;
        public int Size { get; set; } = 8;
        public List<string> ExcludeIds { get; set; } = new();
        public List<string> RecentlyViewedIds { get; set; } = new();
        public string? Seed { get; set; }
    }

    /// <summary>
    /// Lightweight related species card with scoring metadata for the detail page.
    /// </summary>
    public class RelatedSpeciesDto : SpeciesDto
    {
        public decimal Score { get; set; }
        public ICollection<string> MatchReasons { get; set; } = new List<string>();
    }
}
