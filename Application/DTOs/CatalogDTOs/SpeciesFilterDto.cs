using Domain.Enums;

namespace Application.DTOs.CatalogDTOs
{
    /// <summary>
    /// Filter DTO for species pagination and search.
    /// Supports filtering across Species, SpeciesProfile, SpeciesEnvironment, and SpeciesTags.
    /// </summary>
    public class SpeciesFilterDto
    {
        // ── Pagination ───────────────────────────────────────────────────────
        public int Page { get; set; } = 1;
        public int Size { get; set; } = 12;

        // ── Sorting ──────────────────────────────────────────────────────────
        public string SortBy { get; set; } = "CommonName";
        public bool IsAscending { get; set; } = true;

        // ── Full-text / name search ──────────────────────────────────────────
        public string? SearchTerm { get; set; }

        // ── Species table filters ────────────────────────────────────────────
        /// <summary>Filter by Species.TypeId (foreign key to Type table).</summary>
        public string? TypeId { get; set; }

        /// <summary>Admin-only: filter by active status. Not exposed on the public catalog.</summary>
        public bool? IsActive { get; set; }

        // ── SpeciesEnvironment filters ───────────────────────────────────────
        /// <summary>Include species whose pH range overlaps [PhMin, PhMax].</summary>
        public decimal? PhMin { get; set; }
        /// <summary>Include species whose pH range overlaps [PhMin, PhMax].</summary>
        public decimal? PhMax { get; set; }

        /// <summary>Include species whose temperature range overlaps [TempMin, TempMax] (°C).</summary>
        public int? TempMin { get; set; }
        /// <summary>Include species whose temperature range overlaps [TempMin, TempMax] (°C).</summary>
        public int? TempMax { get; set; }

        /// <summary>Filter by water type (0=Fresh, 1=Brackish, 2=Salt).</summary>
        public WaterType? WaterType { get; set; }

        // ── SpeciesProfile filters ────────────────────────────────────────────
        /// <summary>Filter by diet classification.</summary>
        public DietType? DietType { get; set; }

        /// <summary>Filter by swim level (Top/Middle/Bottom/All).</summary>
        public SwimLevel? SwimLevel { get; set; }

        /// <summary>
        /// Filter by origin substring (case-insensitive partial match).
        /// e.g. "Amazon" matches "Amazon Basin, South America".
        /// </summary>
        public string? Origin { get; set; }

        /// <summary>When true, only schooling species are returned.</summary>
        public bool? IsSchooling { get; set; }

        /// <summary>
        /// Maximum adult size filter in centimetres.
        /// Returns species whose AdultSize is &lt;= this value.
        /// </summary>
        public decimal? MaxAdultSize { get; set; }

        // ── SpeciesTags filter ────────────────────────────────────────────────
        /// <summary>
        /// Filter species that have ALL of the specified tag IDs.
        /// Leave empty or null to skip tag filtering.
        /// </summary>
        public List<string>? TagIds { get; set; }
    }
}

