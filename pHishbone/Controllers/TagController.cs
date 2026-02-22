using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Route(ApiEndpointConstant.Tag.Base)]
    public class TagController : ControllerBase
    {
        private readonly ITagService _tagService;
        private readonly ILogger<TagController> _logger;

        public TagController(ITagService tagService, ILogger<TagController> logger)
        {
            _tagService = tagService;
            _logger = logger;
        }

        /// <summary>
        /// Get a tag by ID
        /// </summary>
        [HttpGet(ApiEndpointConstant.Tag.GetById)]
        [ProducesResponseType(typeof(ApiResponse<TagDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] string id)
        {
            var tag = await _tagService.GetByIdAsync(id);
            return Ok(ApiResponse<TagDto>.Success(tag, SuccessMessageConstant.TagRetrievedSuccessfully));
        }

        /// <summary>
        /// Get all tags
        /// </summary>
        [HttpGet(ApiEndpointConstant.Tag.GetList)]
        [ProducesResponseType(typeof(ApiResponse<ICollection<TagDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetList()
        {
            var tags = await _tagService.GetListAsync();
            return Ok(ApiResponse<ICollection<TagDto>>.Success(tags, SuccessMessageConstant.TagsRetrievedSuccessfully));
        }

        /// <summary>
        /// Get paginated tags with filter
        /// </summary>
        [HttpGet(ApiEndpointConstant.Tag.GetPaginated)]
        [ProducesResponseType(typeof(ApiResponse<PaginationResponse<TagDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaginated([FromQuery] TagFilterDto filter)
        {
            var tags = await _tagService.GetPaginatedListAsync(filter);
            return Ok(ApiResponse<PaginationResponse<TagDto>>.Success(tags, SuccessMessageConstant.TagsRetrievedSuccessfully));
        }

        /// <summary>
        /// Create a new tag
        /// </summary>
        [HttpPost(ApiEndpointConstant.Tag.Create)]
        [ProducesResponseType(typeof(ApiResponse<TagDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateTagDto dto)
        {
            var tag = await _tagService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetById),
                new { id = tag.Id },
                ApiResponse<TagDto>.Success(tag, SuccessMessageConstant.TagCreatedSuccessfully, 201)
            );
        }

        /// <summary>
        /// Create multiple tags at once
        /// </summary>
        [HttpPost(ApiEndpointConstant.Tag.CreateRange)]
        [ProducesResponseType(typeof(ApiResponse<ICollection<TagDto>>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> CreateRange([FromBody] List<CreateTagDto> dtos)
        {
            var tags = await _tagService.CreateRangeAsync(dtos);
            return Ok(ApiResponse<ICollection<TagDto>>.Success(tags, SuccessMessageConstant.TagsCreatedSuccessfully, 201));
        }

        /// <summary>
        /// Update an existing tag
        /// </summary>
        [HttpPut(ApiEndpointConstant.Tag.Update)]
        [ProducesResponseType(typeof(ApiResponse<TagDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateTagDto dto)
        {
            var tag = await _tagService.UpdateAsync(id, dto);
            return Ok(ApiResponse<TagDto>.Success(tag, SuccessMessageConstant.TagUpdatedSuccessfully));
        }

        /// <summary>
        /// Delete a tag
        /// </summary>
        [HttpDelete(ApiEndpointConstant.Tag.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] string id)
        {
            await _tagService.DeleteAsync(id);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.TagDeletedSuccessfully));
        }
    }
}
