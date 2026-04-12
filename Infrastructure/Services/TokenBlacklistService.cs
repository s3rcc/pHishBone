using Application.Common.Interfaces;
using Microsoft.Extensions.Caching.Distributed;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Redis-backed implementation of JWT token blacklisting.
    /// Keys are stored as "blacklist:{jti}" with TTL equal to the token's remaining lifetime.
    /// </summary>
    public class TokenBlacklistService : ITokenBlacklistService
    {
        private readonly IDistributedCache _cache;
        private readonly ILogger<TokenBlacklistService> _logger;

        // Prefix keeps blacklist keys isolated from other Redis entries
        private const string KeyPrefix = "blacklist:";

        public TokenBlacklistService(IDistributedCache cache, ILogger<TokenBlacklistService> logger)
        {
            _cache = cache;
            _logger = logger;
        }

        /// <inheritdoc/>
        public async Task BlacklistTokenAsync(string jti, TimeSpan ttl, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(jti))
            {
                _logger.LogWarning("BlacklistTokenAsync called with null/empty jti — skipping");
                return;
            }

            // Clamp negative TTL (already-expired tokens) to a short window to avoid negative expiry
            if (ttl <= TimeSpan.Zero)
                ttl = TimeSpan.FromSeconds(30);

            var key = KeyPrefix + jti;
            var options = new DistributedCacheEntryOptions
            {
                AbsoluteExpirationRelativeToNow = ttl
            };

            // Value is meaningless; existence of the key is the blacklist signal
            await _cache.SetStringAsync(key, "1", options, ct);

            _logger.LogInformation(
                "Token blacklisted. Jti: {Jti}, TTL: {Ttl}",
                jti, ttl);
        }

        /// <inheritdoc/>
        public async Task<bool> IsTokenBlacklistedAsync(string jti, CancellationToken ct = default)
        {
            if (string.IsNullOrEmpty(jti))
                return false;

            var key = KeyPrefix + jti;
            var value = await _cache.GetStringAsync(key, ct);

            var isBlacklisted = value != null;

            if (isBlacklisted)
                _logger.LogWarning("Rejected blacklisted token. Jti: {Jti}", jti);

            return isBlacklisted;
        }
    }
}
