using Application.Common.Interfaces;
using Application.Constants;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;
using StackExchange.Redis;
using System.Text.Json;

namespace Infrastructure.Services
{
    /// <summary>
    /// Redis-backed implementation of <see cref="ICacheService"/>.
    /// Uses <see cref="IDistributedCache"/> for get/set/remove and
    /// <see cref="IConnectionMultiplexer"/> for prefix-based removal via SCAN.
    /// </summary>
    public class RedisCacheService : ICacheService
    {
        private readonly IDistributedCache _cache;
        private readonly IConnectionMultiplexer? _redis;
        private readonly ILogger<RedisCacheService> _logger;

        private static readonly JsonSerializerOptions _jsonOptions = new()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            PropertyNameCaseInsensitive = true
        };

        public RedisCacheService(
            IDistributedCache cache,
            ILogger<RedisCacheService> logger,
            IConnectionMultiplexer? redis = null)
        {
            _cache = cache;
            _logger = logger;
            _redis = redis;
        }

        /// <inheritdoc/>
        public async Task<T?> GetAsync<T>(string key, CancellationToken ct = default)
        {
            try
            {
                var cached = await _cache.GetStringAsync(key, ct);
                if (cached == null)
                {
                    _logger.LogDebug("Cache MISS for key: {CacheKey}", key);
                    return default;
                }

                _logger.LogDebug("Cache HIT for key: {CacheKey}", key);
                return JsonSerializer.Deserialize<T>(cached, _jsonOptions);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache GET failed for key: {CacheKey}. Proceeding without cache.", key);
                return default;
            }
        }

        /// <inheritdoc/>
        public async Task SetAsync<T>(string key, T value, TimeSpan? expiry = null, CancellationToken ct = default)
        {
            try
            {
                var options = new DistributedCacheEntryOptions
                {
                    AbsoluteExpirationRelativeToNow = expiry
                        ?? TimeSpan.FromMinutes(CacheKeyConstant.DefaultExpiryMinutes)
                };

                var json = JsonSerializer.Serialize(value, _jsonOptions);
                await _cache.SetStringAsync(key, json, options, ct);

                _logger.LogDebug("Cache SET for key: {CacheKey}, TTL: {Ttl}", key, options.AbsoluteExpirationRelativeToNow);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache SET failed for key: {CacheKey}. Proceeding without cache.", key);
            }
        }

        /// <inheritdoc/>
        public async Task RemoveAsync(string key, CancellationToken ct = default)
        {
            try
            {
                await _cache.RemoveAsync(key, ct);
                _logger.LogDebug("Cache REMOVE for key: {CacheKey}", key);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache REMOVE failed for key: {CacheKey}.", key);
            }
        }

        /// <inheritdoc/>
        public async Task RemoveByPrefixAsync(string prefix, CancellationToken ct = default)
        {
            if (_redis == null)
            {
                _logger.LogWarning("IConnectionMultiplexer is not available. Cannot remove by prefix: {Prefix}", prefix);
                return;
            }

            try
            {
                var server = _redis.GetServer(_redis.GetEndPoints().First());
                var keys = server.Keys(pattern: $"*{prefix}*").ToArray();

                if (keys.Length == 0)
                {
                    _logger.LogDebug("No cache keys found for prefix: {Prefix}", prefix);
                    return;
                }

                var db = _redis.GetDatabase();
                await db.KeyDeleteAsync(keys);

                _logger.LogInformation(
                    "Cache INVALIDATE by prefix: {Prefix}, removed {Count} keys",
                    prefix, keys.Length);
            }
            catch (Exception ex)
            {
                _logger.LogWarning(ex, "Cache prefix removal failed for: {Prefix}.", prefix);
            }
        }
    }
}
