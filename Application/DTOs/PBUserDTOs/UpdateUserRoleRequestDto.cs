using Domain.Enums;
using System.Text.Json.Serialization;

namespace Application.DTOs.PBUserDTOs
{
    public record UpdateUserRoleRequestDto
    {
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public Role Role { get; init; }
    }
}
