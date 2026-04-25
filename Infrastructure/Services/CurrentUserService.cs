using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.Security.Claims;

namespace Infrastructure.Services
{
    /// <summary>
    /// Service for accessing the current authenticated user's context from HTTP headers.
    /// Extracts user information from JWT claims.
    /// </summary>
    public class CurrentUserService : Application.Common.Interfaces.ICurrentUserService
    {
        private readonly IHttpContextAccessor _httpContextAccessor;
        private readonly ILogger<CurrentUserService> _logger;

        public CurrentUserService(IHttpContextAccessor httpContextAccessor, ILogger<CurrentUserService> logger)
        {
            _httpContextAccessor = httpContextAccessor;
            _logger = logger;
        }

        /// <summary>
        /// Gets the current HTTP context user claims principal.
        /// </summary>
        private ClaimsPrincipal? User => _httpContextAccessor.HttpContext?.User;

        /// <summary>
        /// Gets the current user's ID from JWT 'sub' claim (Supabase User ID).
        /// </summary>
        public string? GetUserId()
        {
            _logger.LogInformation("Retrieved User ID: {UserId}", User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? User?.FindFirst("sub")?.Value);
            return User?.FindFirst(ClaimTypes.NameIdentifier)?.Value 
                ?? User?.FindFirst("sub")?.Value;
            
        }

        /// <summary>
        /// Gets the current user's email from JWT 'email' claim.
        /// </summary>
        public string? GetUserEmail()
        {
            return User?.FindFirst(ClaimTypes.Email)?.Value 
                ?? User?.FindFirst("email")?.Value;
        }

        /// <summary>
        /// Gets the current user's username from JWT 'username' or 'user_metadata.username' claim.
        /// </summary>
        public string? GetUsername()
        {
            return User?.FindFirst("username")?.Value 
                ?? User?.FindFirst("user_metadata.username")?.Value
                ?? User?.FindFirst(ClaimTypes.Name)?.Value;
        }

        /// <summary>
        /// Gets the current user's role from JWT 'role' or 'app_metadata.role' claim.
        /// </summary>
        public string? GetRole()
        {
            return User?.FindFirst("app_role")?.Value
                ?? User?.FindFirst(ClaimTypes.Role)?.Value 
                ?? User?.FindFirst("role")?.Value
                ?? User?.FindFirst("app_metadata.role")?.Value;
        }

        /// <summary>
        /// Checks if the current request is authenticated.
        /// </summary>
        public bool IsAuthenticated()
        {
            return User?.Identity?.IsAuthenticated ?? false;
        }

        /// <summary>
        /// Checks if the current user is in the specified role.
        /// </summary>
        public bool IsInRole(string role)
        {
            if (!IsAuthenticated())
                return false;

            var userRole = GetRole();
            return !string.IsNullOrEmpty(userRole) && 
                   userRole.Equals(role, StringComparison.OrdinalIgnoreCase);
        }
    }
}
