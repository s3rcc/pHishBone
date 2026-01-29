using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Route(ApiEndpointConstant.Type.Base)]
    public class TypeController : ControllerBase
    {
        private readonly ITypeService _typeService;
        private readonly ILogger<TypeController> _logger;

        public TypeController(ITypeService typeService, ILogger<TypeController> logger)
        {
            _typeService = typeService;
            _logger = logger;
        }

        /// <summary>
        /// Get a type by ID
        /// </summary>
        [HttpGet(ApiEndpointConstant.Type.GetById)]
        [ProducesResponseType(typeof(ApiResponse<TypeDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] string id)
        {
            var type = await _typeService.GetByIdAsync(id);
            return Ok(ApiResponse<TypeDto>.Success(type, "Type retrieved successfully"));
        }

        /// <summary>
        /// Get all types
        /// </summary>
        [HttpGet(ApiEndpointConstant.Type.GetList)]
        [ProducesResponseType(typeof(ApiResponse<ICollection<TypeDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetList()
        {
            var types = await _typeService.GetListAsync();
            return Ok(ApiResponse<ICollection<TypeDto>>.Success(types, "Types retrieved successfully"));
        }

        /// <summary>
        /// Get paginated types with filter
        /// </summary>
        [HttpGet(ApiEndpointConstant.Type.GetPaginated)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaginated([FromQuery] TypeFilterDto filter)
        {
            var types = await _typeService.GetPaginatedListAsync(filter);
            return Ok(ApiResponse<object>.Success(types, "Types retrieved successfully"));
        }

        /// <summary>
        /// Create a new type
        /// </summary>
        [HttpPost(ApiEndpointConstant.Type.Create)]
        [ProducesResponseType(typeof(ApiResponse<TypeDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateTypeDto dto)
        {
            var type = await _typeService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetById),
                new { id = type.Id },
                ApiResponse<TypeDto>.Success(type, "Type created successfully", 201)
            );
        }

        /// <summary>
        /// Create multiple types at once
        /// </summary>
        [HttpPost(ApiEndpointConstant.Type.CreateRange)]
        [ProducesResponseType(typeof(ApiResponse<ICollection<TypeDto>>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateRange([FromBody] List<CreateTypeDto> dtos)
        {
            var types = await _typeService.CreateRangeAsync(dtos);
            return Ok(ApiResponse<ICollection<TypeDto>>.Success(types, "Types created successfully", 201));
        }

        /// <summary>
        /// Update an existing type
        /// </summary>
        [HttpPut(ApiEndpointConstant.Type.Update)]
        [ProducesResponseType(typeof(ApiResponse<TypeDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateTypeDto dto)
        {
            var type = await _typeService.UpdateAsync(id, dto);
            return Ok(ApiResponse<TypeDto>.Success(type, "Type updated successfully"));
        }

        /// <summary>
        /// Delete a type
        /// </summary>
        [HttpDelete(ApiEndpointConstant.Type.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] string id)
        {
            await _typeService.DeleteAsync(id);
            return Ok(ApiResponse<object>.Success(null, "Type deleted successfully"));
        }
    }
}
