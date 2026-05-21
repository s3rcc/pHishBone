using Application.DTOs.ProjectDTOs;

namespace Application.Services
{
    /// <summary>
    /// Service interface for the optimized tank analysis v2 read path.
    /// </summary>
    public interface ITankAnalysisV2Service
    {
        /// <summary>
        /// Get a real-time analysis report for a tank using projection-based reads.
        /// </summary>
        Task<TankAnalysisReportDto> GetTankAnalysisV2Async(string tankId, string userId, CancellationToken cancellationToken = default);
    }
}
