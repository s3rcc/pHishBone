namespace Application.Constants
{
    /// <summary>
    /// Centralized cache key constants.
    /// All cache keys follow the pattern "domain:entity:qualifier:id".
    /// </summary>
    public static class CacheKeyConstant
    {
        // ─── Tags ────────────────────────────────────────────────────
        public const string TagAll = "catalog:tags:all";
        public const string TagById = "catalog:tags:id:";
        public const string TagPaginated = "catalog:tags:paginated:";
        public const string TagPrefix = "catalog:tags:";

        // ─── Types ───────────────────────────────────────────────────
        public const string TypeAll = "catalog:types:all";
        public const string TypeById = "catalog:types:id:";
        public const string TypePaginated = "catalog:types:paginated:";
        public const string TypePrefix = "catalog:types:";

        // ─── Species ─────────────────────────────────────────────────
        public const string SpeciesById = "catalog:species:id:";
        public const string SpeciesBySlug = "catalog:species:slug:";
        public const string SpeciesPaginated = "catalog:species:paginated:";
        public const string SpeciesPrefix = "catalog:species:";

        // ─── Cache TTL (minutes) ─────────────────────────────────────
        public const int DefaultExpiryMinutes = 10;
        public const int ListExpiryMinutes = 5;
    }
}
