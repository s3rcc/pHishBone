namespace Application.Constants
{
    public static class AuthorizationConstant
    {
        public const string MemberRole = "Member";
        public const string KnowledgeManagerRole = "KnowledgeManager";
        public const string AdminRole = "Admin";

        public const string CatalogManagementRoles = AdminRole + "," + KnowledgeManagerRole;
        public const string AdminOnlyPolicy = "AdminOnly";
        public const string CatalogManagementPolicy = "CatalogManagement";
    }
}
