namespace Domain.Enums
{
    /// <summary>
    /// User role enumeration for authorization and access control.
    /// </summary>
    public enum Role
    {
        /// <summary>
        /// Regular user with basic permissions
        /// </summary>
        User = 0,

        /// <summary>
        /// Moderator with elevated permissions
        /// </summary>
        Moderator = 1,

        /// <summary>
        /// Administrator with full permissions
        /// </summary>
        Admin = 2
    }
}
