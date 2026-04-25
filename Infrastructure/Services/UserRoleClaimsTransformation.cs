using Domain.Entities;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Infrastructure.Services
{
    /// <summary>
    /// Enriches Supabase-authenticated principals with the application role stored in PBUser.
    /// </summary>
    public class UserRoleClaimsTransformation : IClaimsTransformation
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ILogger<UserRoleClaimsTransformation> _logger;

        public UserRoleClaimsTransformation(
            IUnitOfWork unitOfWork,
            ILogger<UserRoleClaimsTransformation> logger)
        {
            _unitOfWork = unitOfWork;
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

            var applicationRole = user.Role.ToString();

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
