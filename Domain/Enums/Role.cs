namespace Domain.Enums
{
    /// <summary>
    /// User role enumeration for authorization and access control.
    /// </summary>
    public enum Role
    {
        /// <summary>
        /// Default role assigned to every newly registered user.
        /// </summary>
        Member = 0,

        /// <summary>
        /// Catalog curator with elevated write access to knowledge content.
        /// </summary>
        KnowledgeManager = 1,

        /// <summary>
        /// Administrator with full permissions
        /// </summary>
        Admin = 2
    }
}
