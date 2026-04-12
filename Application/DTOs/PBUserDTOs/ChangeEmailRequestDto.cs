namespace Application.DTOs.PBUserDTOs
{
    public record ChangeEmailRequestDto
    {
        public string NewEmail { get; init; } = string.Empty;
    }
}
