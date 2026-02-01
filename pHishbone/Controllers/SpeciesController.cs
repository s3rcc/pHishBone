using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Route(ApiEndpointConstant.Species.Base)]
    public class SpeciesController : ControllerBase
    {
        private readonly ISpeciesService _speciesService;
        private readonly ILogger<SpeciesController> _logger;

        public SpeciesController(ISpeciesService speciesService, ILogger<SpeciesController> logger)
        {
            _speciesService = speciesService;
            _logger = logger;
        }

        /// <summary>
        /// Get basic species information by ID
        /// </summary>
        [HttpGet(ApiEndpointConstant.Species.GetById)]
        [ProducesResponseType(typeof(ApiResponse<SpeciesDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] string id)
        {
            var species = await _speciesService.GetByIdAsync(id);
            return Ok(ApiResponse<SpeciesDto>.Success(species, "Species retrieved successfully"));
        }

        /// <summary>
        /// Get full species details including environment, profile, and tags
        /// </summary>
        [HttpGet(ApiEndpointConstant.Species.GetDetailById)]
        [ProducesResponseType(typeof(ApiResponse<SpeciesDetailDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetDetailById([FromRoute] string id)
        {
            var species = await _speciesService.GetDetailByIdAsync(id);
            return Ok(ApiResponse<SpeciesDetailDto>.Success(species, "Species details retrieved successfully"));
        }

        /// <summary>
        /// Get all species
        /// </summary>
        [HttpGet(ApiEndpointConstant.Species.GetList)]
        [ProducesResponseType(typeof(ApiResponse<ICollection<SpeciesDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetList()
        {
            var species = await _speciesService.GetListAsync();
            return Ok(ApiResponse<ICollection<SpeciesDto>>.Success(species, "Species list retrieved successfully"));
        }

        /// <summary>
        /// Get paginated species with filtering and search
        /// </summary>
        [HttpGet(ApiEndpointConstant.Species.GetPaginated)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaginated([FromQuery] SpeciesFilterDto filter)
        {
            var species = await _speciesService.GetPaginatedListAsync(filter);
            return Ok(ApiResponse<object>.Success(species, "Species retrieved successfully"));
        }

        /// <summary>
        /// Create a new species with environment, profile, and tags
        /// </summary>
        [HttpPost(ApiEndpointConstant.Species.Create)]
        [ProducesResponseType(typeof(ApiResponse<SpeciesDetailDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateSpeciesDto dto)
        {
            var species = await _speciesService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetDetailById),
                new { id = species.Id },
                ApiResponse<SpeciesDetailDto>.Success(species, "Species created successfully", 201)
            );
        }

        /// <summary>
        /// Update an existing species
        /// </summary>
        [HttpPut(ApiEndpointConstant.Species.Update)]
        [ProducesResponseType(typeof(ApiResponse<SpeciesDetailDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateSpeciesDto dto)
        {
            var species = await _speciesService.UpdateAsync(id, dto);
            return Ok(ApiResponse<SpeciesDetailDto>.Success(species, "Species updated successfully"));
        }

        /// <summary>
        /// Soft delete a species
        /// </summary>
        [HttpDelete(ApiEndpointConstant.Species.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] string id)
        {
            await _speciesService.DeleteAsync(id);
            return Ok(ApiResponse<object>.Success(null, "Species deleted successfully"));
        }
    }
}
