namespace Application.Common.Interfaces
{
    /// <summary>
    /// Generic cache abstraction over IDistributedCache.
    /// Registered as Singleton (per SKILL.md: "Use Singleton for Cache").
    /// </summary>
    public interface ICacheService
    {
        /// <summary>
        /// Retrieve a cached value by key.
        /// Returns default(T) on cache miss.
        /// </summary>
        Task<T?> GetAsync<T>(string key, CancellationToken ct = default);

        /// <summary>
        /// Store a value in the cache with an optional expiry.
        /// Falls back to <see cref="Application.Constants.CacheKeyConstant.DefaultExpiryMinutes"/> if expiry is null.
        /// </summary>
        Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default);

        /// <summary>
        /// Remove a single key from the cache.
        /// </summary>
        Task RemoveAsync(string key, CancellationToken ct = default);

        /// <summary>
        /// Remove all keys matching a given prefix (e.g. "catalog:tags:").
        /// Uses Redis SCAN to avoid blocking the server.
        /// </summary>
        Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default);
    }
}
