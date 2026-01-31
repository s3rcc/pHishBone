namespace Application.Common.Interfaces
{
    /// <summary>
    /// Service for accessing the current authenticated user's context.
    /// Extracts user information from JWT claims in HTTP headers.
    /// </summary>
    public interface ICurrentUserService
    {
        /// <summary>
        /// Gets the current user's ID from JWT claims.
        /// </summary>
        /// <returns>User ID or null if not authenticated</returns>
        string? GetUserId();

        /// <summary>
        /// Gets the current user's email from JWT claims.
        /// </summary>
        /// <returns>Email or null if not authenticated</returns>
        string? GetUserEmail();

        /// <summary>
        /// Gets the current user's username from JWT claims.
        /// </summary>
        /// <returns>Username or null if not authenticated</returns>
        string? GetUsername();

        /// <summary>
        /// Gets the current user's role from JWT claims.
        /// </summary>
        /// <returns>Role name or null if not authenticated</returns>
        string? GetRole();

        /// <summary>
        /// Checks if the current request is authenticated.
        /// </summary>
        /// <returns>True if authenticated, false otherwise</returns>
        bool IsAuthenticated();

        /// <summary>
        /// Checks if the current user is in the specified role.
        /// </summary>
        /// <param name="role">Role name to check</param>
        /// <returns>True if user is in role, false otherwise</returns>
        bool IsInRole(string role);
    }
}
