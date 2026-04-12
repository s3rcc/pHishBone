using System.Text.Json.Serialization;
using Domain.Enums;

namespace Application.DTOs.CatalogDTOs
{
    /// <summary>
    /// Response DTO for a compatibility rule, includes resolved tag names.
    /// </summary>
    public class CompatibilityRuleDto
    {
        public string Id { get; set; } = string.Empty;
        public string SubjectTagId { get; set; } = string.Empty;
        public string SubjectTagName { get; set; } = string.Empty;
        public string ObjectTagId { get; set; } = string.Empty;
        public string ObjectTagName { get; set; } = string.Empty;
        public string Severity { get; set; } = string.Empty;
        public string Message { get; set; } = string.Empty;
        public DateTime CreatedTime { get; set; }
    }

    /// <summary>
    /// Filter DTO for paginated compatibility rule queries.
    /// </summary>
    public class CompatibilityRuleFilterDto
    {
        public int Page { get; set; } = 1;
        public int Size { get; set; } = 10;
        public string? SearchTerm { get; set; }
        public string? SortBy { get; set; }
        public bool IsAscending { get; set; } = true;
    }

    /// <summary>
    /// DTO for creating a new compatibility rule.
    /// </summary>
    public class CreateCompatibilityRuleDto
    {
        public string SubjectTagId { get; set; } = string.Empty;
        public string ObjectTagId { get; set; } = string.Empty;
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Severity Severity { get; set; }
        public string Message { get; set; } = string.Empty;
    }

    /// <summary>
    /// DTO for updating an existing compatibility rule.
    /// Only Severity and Message are mutable; tags cannot be changed.
    /// </summary>
    public class UpdateCompatibilityRuleDto
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Severity Severity { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}
