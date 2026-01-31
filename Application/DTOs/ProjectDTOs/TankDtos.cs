using Domain.Enums;

namespace Application.DTOs.ProjectDTOs
{
    /// <summary>
    /// DTO for creating a new tank.
    /// </summary>
    public record CreateTankDto(
        string Name,
        int Width,
        int Height,
        int Depth,
        int WaterVolume,
        WaterType WaterType
    );

    /// <summary>
    /// DTO for updating an existing tank.
    /// </summary>
    public record UpdateTankDto(
        string Name,
        int Width,
        int Height,
        int Depth,
        int WaterVolume,
        WaterType WaterType,
        TankStatus Status
    );

    /// <summary>
    /// DTO for tank response with full details.
    /// </summary>
    public record TankResponseDto(
        string Id,
        string UserId,
        string Name,
        int Width,
        int Height,
        int Depth,
        int WaterVolume,
        WaterType WaterType,
        TankStatus Status,
        int ItemCount,
        DateTime CreatedTime,
        DateTime? LastUpdatedTime
    );

    /// <summary>
    /// Lightweight DTO for tank list views.
    /// </summary>
    public record TankListItemDto(
        string Id,
        string Name,
        int WaterVolume,
        WaterType WaterType,
        TankStatus Status,
        int ItemCount,
        DateTime CreatedTime
    );
}
