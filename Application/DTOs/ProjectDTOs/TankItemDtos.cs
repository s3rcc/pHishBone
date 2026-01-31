using Domain.Enums;

namespace Application.DTOs.ProjectDTOs
{
    /// <summary>
    /// DTO for adding an item to a tank.
    /// </summary>
    public record AddTankItemDto(
        ItemType ItemType,
        string ReferenceId,
        int Quantity,
        string? Note
    );

    /// <summary>
    /// DTO for updating a tank item.
    /// </summary>
    public record UpdateTankItemDto(
        int Quantity,
        string? Note
    );

    /// <summary>
    /// DTO for tank item response.
    /// </summary>
    public record TankItemResponseDto(
        string Id,
        string TankId,
        ItemType ItemType,
        string ReferenceId,
        int Quantity,
        string? Note,
        DateTime CreatedTime
    );
}
