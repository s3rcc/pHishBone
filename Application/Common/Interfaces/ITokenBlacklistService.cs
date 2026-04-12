namespace Application.Common.Interfaces
{
    /// <summary>
    /// Provides Redis-backed JWT token blacklisting for logout invalidation.
    /// </summary>
    public interface ITokenBlacklistService
    {
        /// <summary>
        /// Adds the given JWT ID (jti) to the blacklist with the specified TTL.
        /// </summary>
        Task BlacklistTokenAsync(string jti, TimeSpan ttl, CancellationToken ct = default);

        /// <summary>
        /// Returns true if the given JWT ID is present in the blacklist.
        /// </summary>
        Task<bool> IsTokenBlacklistedAsync(string jti, CancellationToken ct = default);
    }
}
