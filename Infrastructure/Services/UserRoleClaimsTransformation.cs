using Domain.Entities;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Infrastructure.Services
{
    /// <summary>
    /// Enriches Supabase-authenticated principals with the application role stored in PBUser.
    /// </summary>
    public class UserRoleClaimsTransformation : IClaimsTransformation
    {
        private static readonly TimeSpan RoleCacheDuration = TimeSpan.FromMinutes(5);

        private readonly IUnitOfWork _unitOfWork;
        private readonly IMemoryCache _memoryCache;
        private readonly ILogger<UserRoleClaimsTransformation> _logger;

        public UserRoleClaimsTransformation(
            IUnitOfWork unitOfWork,
            IMemoryCache memoryCache,
            ILogger<UserRoleClaimsTransformation> logger)
        {
            _unitOfWork = unitOfWork;
            _memoryCache = memoryCache;
            _logger = logger;
        }

        public async Task<ClaimsPrincipal> TransformAsync(ClaimsPrincipal principal)
        {
            if (principal.Identity is not ClaimsIdentity identity || !identity.IsAuthenticated)
            {
                return principal;
            }

            var supabaseUserId = identity.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? identity.FindFirst("sub")?.Value;

            if (string.IsNullOrWhiteSpace(supabaseUserId))
            {
                return principal;
            }

            var cacheKey = $"auth:app-role:{supabaseUserId}";
            if (!_memoryCache.TryGetValue(cacheKey, out string? applicationRole))
            {
                var user = await _unitOfWork.Repository<PBUser>()
                    .SingleOrDefaultAsync(
                        predicate: item => item.SupabaseUserId == supabaseUserId && item.DeletedTime == null);

                if (user == null)
                {
                    _logger.LogWarning(
                        "Authenticated Supabase user {SupabaseUserId} does not have a local PBUser role record",
                        supabaseUserId);
                    return principal;
                }

                applicationRole = user.Role.ToString();
                _memoryCache.Set(cacheKey, applicationRole, RoleCacheDuration);
            }

            foreach (var existingRoleClaim in identity.FindAll(ClaimTypes.Role).ToList())
            {
                identity.RemoveClaim(existingRoleClaim);
            }

            foreach (var existingAppRoleClaim in identity.FindAll("app_role").ToList())
            {
                identity.RemoveClaim(existingAppRoleClaim);
            }

            identity.AddClaim(new Claim(ClaimTypes.Role, applicationRole));
            identity.AddClaim(new Claim("app_role", applicationRole));

            return principal;
        }
    }
}
