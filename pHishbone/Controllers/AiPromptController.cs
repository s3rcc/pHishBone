using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.AiDTOs;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Route(ApiEndpointConstant.AiPromptAdmin.Base)]
    public class AiPromptController : ControllerBase
    {
        private readonly IAiPromptTemplateService _aiPromptTemplateService;

        public AiPromptController(IAiPromptTemplateService aiPromptTemplateService)
        {
            _aiPromptTemplateService = aiPromptTemplateService;
        }

        [HttpGet(ApiEndpointConstant.AiPromptAdmin.GetById)]
        [ProducesResponseType(typeof(ApiResponse<AiPromptTemplateDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] string id, CancellationToken cancellationToken)
        {
            var item = await _aiPromptTemplateService.GetByIdAsync(id, cancellationToken);
            return Ok(ApiResponse<AiPromptTemplateDto>.Success(item, SuccessMessageConstant.AiPromptRetrievedSuccessfully));
        }

        [HttpGet(ApiEndpointConstant.AiPromptAdmin.GetList)]
        [ProducesResponseType(typeof(ApiResponse<ICollection<AiPromptTemplateDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetList(CancellationToken cancellationToken)
        {
            var items = await _aiPromptTemplateService.GetListAsync(cancellationToken);
            return Ok(ApiResponse<ICollection<AiPromptTemplateDto>>.Success(items, SuccessMessageConstant.AiPromptsRetrievedSuccessfully));
        }

        [HttpGet(ApiEndpointConstant.AiPromptAdmin.GetPaginated)]
        [ProducesResponseType(typeof(ApiResponse<PaginationResponse<AiPromptTemplateDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaginated([FromQuery] AiPromptTemplateFilterDto filter, CancellationToken cancellationToken)
        {
            var items = await _aiPromptTemplateService.GetPaginatedListAsync(filter, cancellationToken);
            return Ok(ApiResponse<PaginationResponse<AiPromptTemplateDto>>.Success(items, SuccessMessageConstant.AiPromptsRetrievedSuccessfully));
        }

        [HttpPost(ApiEndpointConstant.AiPromptAdmin.Create)]
        [ProducesResponseType(typeof(ApiResponse<AiPromptTemplateDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateAiPromptTemplateDto dto, CancellationToken cancellationToken)
        {
            var item = await _aiPromptTemplateService.CreateAsync(dto, cancellationToken);
            return CreatedAtAction(
                nameof(GetById),
                new { id = item.Id },
                ApiResponse<AiPromptTemplateDto>.Success(item, SuccessMessageConstant.AiPromptCreatedSuccessfully, StatusCodes.Status201Created)
            );
        }

        [HttpPut(ApiEndpointConstant.AiPromptAdmin.Update)]
        [ProducesResponseType(typeof(ApiResponse<AiPromptTemplateDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateAiPromptTemplateDto dto, CancellationToken cancellationToken)
        {
            var item = await _aiPromptTemplateService.UpdateAsync(id, dto, cancellationToken);
            return Ok(ApiResponse<AiPromptTemplateDto>.Success(item, SuccessMessageConstant.AiPromptUpdatedSuccessfully));
        }

        [HttpDelete(ApiEndpointConstant.AiPromptAdmin.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken cancellationToken)
        {
            await _aiPromptTemplateService.DeleteAsync(id, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.AiPromptDeletedSuccessfully));
        }
    }
}
