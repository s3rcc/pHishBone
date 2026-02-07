using Application.DTOs.ProjectDTOs;

namespace Application.Services
{
    /// <summary>
    /// Service interface for tank management operations.
    /// </summary>
    public interface ITankService
    {
        /// <summary>
        /// Get all tanks for a specific user.
        /// </summary>
        Task<IEnumerable<TankListItemDto>> GetUserTanksAsync(string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Get a tank by ID with authorization check.
        /// </summary>
        Task<TankResponseDto> GetTankByIdAsync(string tankId, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Create a new tank for a user.
        /// </summary>
        Task<TankResponseDto> CreateTankAsync(CreateTankDto dto, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Update an existing tank.
        /// </summary>
        Task<TankResponseDto> UpdateTankAsync(string tankId, UpdateTankDto dto, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Delete a tank (soft delete via BaseEntity).
        /// </summary>
        Task DeleteTankAsync(string tankId, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Get the latest compatibility snapshot for a tank.
        /// </summary>
        Task<TankSnapshotResponseDto?> GetLatestSnapshotAsync(string tankId, CancellationToken cancellationToken = default);
    }
}
