using Application.DTOs.ProjectDTOs;

namespace Application.Services
{
    /// <summary>
    /// Service interface for tank item management operations.
    /// </summary>
    public interface ITankItemService
    {
        /// <summary>
        /// Get all items in a tank.
        /// </summary>
        Task<IEnumerable<TankItemResponseDto>> GetTankItemsAsync(string tankId, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Add an item to a tank with catalog validation and merge logic.
        /// </summary>
        Task<TankItemResponseDto> AddItemAsync(string tankId, AddTankItemDto dto, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Update a tank item.
        /// </summary>
        Task<TankItemResponseDto> UpdateItemAsync(string tankId, string itemId, UpdateTankItemDto dto, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Remove an item from a tank.
        /// </summary>
        Task RemoveItemAsync(string tankId, string itemId, string userId, CancellationToken cancellationToken = default);
    }
}
