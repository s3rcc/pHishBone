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
    [Route("api/[controller]")]
    [Authorize]
    public class TankController : ControllerBase
    {
        private readonly ITankService _tankService;

        public TankController(ITankService tankService)
        {
            _tankService = tankService;
        }

        /// <summary>
        /// Get all tanks for the authenticated user.
        /// </summary>
        [HttpGet]
        public async Task<ActionResult<IEnumerable<TankListItemDto>>> GetUserTanks(CancellationToken cancellationToken)
        {
            var userId = User.FindFirst("sub")?.Value ?? string.Empty;
            var tanks = await _tankService.GetUserTanksAsync(userId, cancellationToken);
            return Ok(tanks);
        }

        /// <summary>
        /// Get a specific tank by ID.
        /// </summary>
        [HttpGet("{id}")]
        public async Task<ActionResult<TankResponseDto>> GetTankById(string id, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst("sub")?.Value ?? string.Empty;
            var tank = await _tankService.GetTankByIdAsync(id, userId, cancellationToken);
            return Ok(tank);
        }

        /// <summary>
        /// Create a new tank.
        /// </summary>
        [HttpPost]
        public async Task<ActionResult<TankResponseDto>> CreateTank([FromBody] CreateTankDto dto, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst("sub")?.Value ?? string.Empty;
            var tank = await _tankService.CreateTankAsync(dto, userId, cancellationToken);
            return CreatedAtAction(nameof(GetTankById), new { id = tank.Id }, tank);
        }

        /// <summary>
        /// Update an existing tank.
        /// </summary>
        [HttpPut("{id}")]
        public async Task<ActionResult<TankResponseDto>> UpdateTank(string id, [FromBody] UpdateTankDto dto, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst("sub")?.Value ?? string.Empty;
            var tank = await _tankService.UpdateTankAsync(id, dto, userId, cancellationToken);
            return Ok(tank);
        }

        /// <summary>
        /// Delete a tank.
        /// </summary>
        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteTank(string id, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst("sub")?.Value ?? string.Empty;
            await _tankService.DeleteTankAsync(id, userId, cancellationToken);
            return NoContent();
        }

        /// <summary>
        /// Add an item to a tank.
        /// </summary>
        [HttpPost("{id}/items")]
        public async Task<ActionResult<TankItemResponseDto>> AddItemToTank(string id, [FromBody] AddTankItemDto dto, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst("sub")?.Value ?? string.Empty;
            var item = await _tankService.AddItemToTankAsync(id, dto, userId, cancellationToken);
            return Ok(item);
        }

        /// <summary>
        /// Update a tank item.
        /// </summary>
        [HttpPut("items/{itemId}")]
        public async Task<ActionResult<TankItemResponseDto>> UpdateTankItem(string itemId, [FromBody] UpdateTankItemDto dto, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst("sub")?.Value ?? string.Empty;
            var item = await _tankService.UpdateTankItemAsync(itemId, dto, userId, cancellationToken);
            return Ok(item);
        }

        /// <summary>
        /// Remove an item from a tank.
        /// </summary>
        [HttpDelete("items/{itemId}")]
        public async Task<ActionResult> RemoveItemFromTank(string itemId, CancellationToken cancellationToken)
        {
            var userId = User.FindFirst("sub")?.Value ?? string.Empty;
            await _tankService.RemoveItemFromTankAsync(itemId, userId, cancellationToken);
            return NoContent();
        }

        /// <summary>
        /// Get the latest compatibility snapshot for a tank.
        /// </summary>
        [HttpGet("{id}/snapshot")]
        public async Task<ActionResult<TankSnapshotResponseDto>> GetLatestSnapshot(string id, CancellationToken cancellationToken)
        {
            var snapshot = await _tankService.GetLatestSnapshotAsync(id, cancellationToken);
            if (snapshot == null)
            {
                return NotFound();
            }
            return Ok(snapshot);
        }
    }
}
