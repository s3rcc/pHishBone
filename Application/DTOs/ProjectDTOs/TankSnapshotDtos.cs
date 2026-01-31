namespace Application.DTOs.ProjectDTOs
{
    /// <summary>
    /// DTO for tank compatibility snapshot response.
    /// </summary>
    public record TankSnapshotResponseDto(
        string Id,
        string TankId,
        int SafetyScore,
        int FilterCapacity,
        List<string> Warnings,
        DateTime CreatedTime
    );
}
