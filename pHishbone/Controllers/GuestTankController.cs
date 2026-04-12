using Application.Common;
using Application.Constants;
using Application.DTOs.ProjectDTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    /// <summary>
    /// Controller for guest tank analysis operations.
    /// </summary>
    [ApiController]
    [Route(ApiEndpointConstant.GuestTank.Base)]
    public class GuestTankController : ControllerBase
    {
        private readonly IGuestTankAnalysisService _guestTankAnalysisService;
        private readonly ILogger<GuestTankController> _logger;

        public GuestTankController(
            IGuestTankAnalysisService guestTankAnalysisService,
            ILogger<GuestTankController> logger)
        {
            _guestTankAnalysisService = guestTankAnalysisService;
            _logger = logger;
        }

        /// <summary>
        /// Get a real-time analysis report for a guest tank draft.
        /// </summary>
        [HttpPost(ApiEndpointConstant.GuestTank.Analysis)]
        [AllowAnonymous]
        [ProducesResponseType(typeof(ApiResponse<TankAnalysisReportDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> AnalyzeGuestTank(
            [FromBody] GuestTankAnalysisRequestDto dto,
            CancellationToken cancellationToken)
        {
            _logger.LogInformation("Running guest tank analysis");

            var report = await _guestTankAnalysisService.AnalyzeGuestTankAsync(dto, cancellationToken);
            return Ok(ApiResponse<TankAnalysisReportDto>.Success(report, SuccessMessageConstant.GuestTankAnalysisRetrievedSuccessfully));
        }
    }
}
