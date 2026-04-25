using Domain.Common;
using Domain.Enums;

namespace Domain.Entities
{
    public class PBUser : BaseEntity
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string SupabaseUserId { get; set; } = string.Empty;
        public Role Role { get; set; } = Role.Member;
        public string? AvatarUrl { get; set; }
        public string? AvatarPublicId { get; set; }
    }
}
