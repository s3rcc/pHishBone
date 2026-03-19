using Application.DTOs.ProjectDTOs;

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
    }
}
