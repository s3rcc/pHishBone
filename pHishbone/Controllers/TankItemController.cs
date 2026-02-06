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
    /// Controller for tank item management operations.
    /// </summary>
    [ApiController]
    [Route(ApiEndpointConstant.TankItem.Base)]
    [Authorize]
    public class TankItemController : ControllerBase
    {
        private readonly ITankItemService _tankItemService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<TankItemController> _logger;

        public TankItemController(
            ITankItemService tankItemService,
            ICurrentUserService currentUserService,
            ILogger<TankItemController> logger)
        {
            _tankItemService = tankItemService;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        /// <summary>
        /// Get all items in a tank.
        /// </summary>
        [HttpGet(ApiEndpointConstant.TankItem.GetAll)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<TankItemResponseDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetTankItems([FromRoute] string tankId, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var items = await _tankItemService.GetTankItemsAsync(tankId, userId, cancellationToken);
            return Ok(ApiResponse<IEnumerable<TankItemResponseDto>>.Success(items, "Tank items retrieved successfully."));
        }

        /// <summary>
        /// Add an item to a tank with catalog validation and merge logic.
        /// </summary>
        [HttpPost(ApiEndpointConstant.TankItem.Add)]
        [ProducesResponseType(typeof(ApiResponse<TankItemResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AddItemToTank([FromRoute] string tankId, [FromBody] AddTankItemDto dto, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Adding item {ReferenceId} to tank {TankId}", dto.ReferenceId, tankId);

            var item = await _tankItemService.AddItemAsync(tankId, dto, userId, cancellationToken);
            return StatusCode(StatusCodes.Status201Created,
                ApiResponse<TankItemResponseDto>.Success(item, SuccessMessageConstant.TankItemAddedSuccessfully, 201));
        }

        /// <summary>
        /// Update a tank item.
        /// </summary>
        [HttpPut(ApiEndpointConstant.TankItem.Update)]
        [ProducesResponseType(typeof(ApiResponse<TankItemResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> UpdateTankItem([FromRoute] string tankId, [FromRoute] string itemId, [FromBody] UpdateTankItemDto dto, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var item = await _tankItemService.UpdateItemAsync(tankId, itemId, dto, userId, cancellationToken);
            return Ok(ApiResponse<TankItemResponseDto>.Success(item, SuccessMessageConstant.TankItemUpdatedSuccessfully));
        }

        /// <summary>
        /// Remove an item from a tank.
        /// </summary>
        [HttpDelete(ApiEndpointConstant.TankItem.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> RemoveItemFromTank([FromRoute] string tankId, [FromRoute] string itemId, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Removing item {ItemId} from tank {TankId}", itemId, tankId);

            await _tankItemService.RemoveItemAsync(tankId, itemId, userId, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.TankItemRemovedSuccessfully));
        }
    }
}
