using Application.DTOs.ProjectDTOs;
using Domain.Entities.Project;

namespace Application.Services
{
    /// <summary>
    /// Service interface for tank analysis operations.
    /// </summary>
    public interface ITankAnalysisService
    {
        /// <summary>
        /// Get a real-time analysis report for a tank.
        /// </summary>
        Task<TankAnalysisReportDto> GetTankAnalysisAsync(string tankId, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Build a real-time analysis report from an already loaded tank aggregate.
        /// </summary>
        Task<TankAnalysisReportDto> GetTankAnalysisForTankAsync(Tank tank, CancellationToken cancellationToken = default);
    }
}
