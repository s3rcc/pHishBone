using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.ProjectDTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    /// <summary>
    /// Controller for tank management operations.
    /// </summary>
    [ApiController]
    [Route(ApiEndpointConstant.Tank.Base)]
    [Authorize]
    public class TankController : ControllerBase
    {
        private readonly ITankService _tankService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<TankController> _logger;

        public TankController(
            ITankService tankService,
            ICurrentUserService currentUserService,
            ILogger<TankController> logger)
        {
            _tankService = tankService;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        /// <summary>
        /// Get all tanks for the current user.
        /// </summary>
        [HttpGet(ApiEndpointConstant.Tank.GetUserTanks)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<TankListItemDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetUserTanks(CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var tanks = await _tankService.GetUserTanksAsync(userId, cancellationToken);
            return Ok(ApiResponse<IEnumerable<TankListItemDto>>.Success(tanks, SuccessMessageConstant.TanksRetrievedSuccessfully));
        }

        /// <summary>
        /// Get a tank by ID.
        /// </summary>
        [HttpGet(ApiEndpointConstant.Tank.GetById)]
        [ProducesResponseType(typeof(ApiResponse<TankResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetTankById([FromRoute] string tankId, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var tank = await _tankService.GetTankByIdAsync(tankId, userId, cancellationToken);
            return Ok(ApiResponse<TankResponseDto>.Success(tank, SuccessMessageConstant.TankRetrievedSuccessfully));
        }

        /// <summary>
        /// Create a new tank.
        /// </summary>
        [HttpPost(ApiEndpointConstant.Tank.Create)]
        [ProducesResponseType(typeof(ApiResponse<TankResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateTank([FromBody] CreateTankDto dto, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Creating new tank for user {UserId}", userId);

            var tank = await _tankService.CreateTankAsync(dto, userId, cancellationToken);
            return CreatedAtAction(
                nameof(GetTankById),
                new { tankId = tank.Id },
                ApiResponse<TankResponseDto>.Success(tank, SuccessMessageConstant.TankCreatedSuccessfully, 201)
            );
        }

        /// <summary>
        /// Update an existing tank.
        /// </summary>
        [HttpPut(ApiEndpointConstant.Tank.Update)]
        [ProducesResponseType(typeof(ApiResponse<TankResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateTank([FromRoute] string tankId, [FromBody] UpdateTankDto dto, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var tank = await _tankService.UpdateTankAsync(tankId, dto, userId, cancellationToken);
            return Ok(ApiResponse<TankResponseDto>.Success(tank, SuccessMessageConstant.TankUpdatedSuccessfully));
        }

        /// <summary>
        /// Delete a tank (soft delete).
        /// </summary>
        [HttpDelete(ApiEndpointConstant.Tank.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> DeleteTank([FromRoute] string tankId, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Deleting tank {TankId} for user {UserId}", tankId, userId);

            await _tankService.DeleteTankAsync(tankId, userId, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.TankDeletedSuccessfully));
        }

        /// <summary>
        /// Get the latest compatibility snapshot for a tank.
        /// </summary>
        [HttpGet(ApiEndpointConstant.Tank.LatestSnapshot)]
        [ProducesResponseType(typeof(ApiResponse<TankSnapshotResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetLatestSnapshot([FromRoute] string tankId, CancellationToken cancellationToken)
        {
            var snapshot = await _tankService.GetLatestSnapshotAsync(tankId, cancellationToken);
            if (snapshot == null)
            {
                return Ok(ApiResponse<TankSnapshotResponseDto?>.Success(null, "No snapshot available for this tank."));
            }

            return Ok(ApiResponse<TankSnapshotResponseDto>.Success(snapshot, "Snapshot retrieved successfully."));
        }
    }
}
