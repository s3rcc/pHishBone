using Application.DTOs.ProjectDTOs;

namespace Application.Services
{
    /// <summary>
    /// Service interface for guest tank analysis operations.
    /// </summary>
    public interface IGuestTankAnalysisService
    {
        /// <summary>
        /// Get a real-time analysis report for a guest tank draft.
        /// </summary>
        Task<TankAnalysisReportDto> AnalyzeGuestTankAsync(GuestTankAnalysisRequestDto dto, CancellationToken cancellationToken = default);
    }
}
