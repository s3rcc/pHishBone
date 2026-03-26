using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.AiDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Authorize]
    [Route(ApiEndpointConstant.AiModelAdmin.Base)]
    public class AiModelController : ControllerBase
    {
        private readonly IAiModelConfigService _aiModelConfigService;

        public AiModelController(IAiModelConfigService aiModelConfigService)
        {
            _aiModelConfigService = aiModelConfigService;
        }

        [HttpGet(ApiEndpointConstant.AiModelAdmin.GetById)]
        [ProducesResponseType(typeof(ApiResponse<AiModelConfigDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] string id, CancellationToken cancellationToken)
        {
            var item = await _aiModelConfigService.GetByIdAsync(id, cancellationToken);
            return Ok(ApiResponse<AiModelConfigDto>.Success(item, SuccessMessageConstant.AiModelRetrievedSuccessfully));
        }

        [HttpGet(ApiEndpointConstant.AiModelAdmin.GetList)]
        [ProducesResponseType(typeof(ApiResponse<ICollection<AiModelConfigDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetList(CancellationToken cancellationToken)
        {
            var items = await _aiModelConfigService.GetListAsync(cancellationToken);
            return Ok(ApiResponse<ICollection<AiModelConfigDto>>.Success(items, SuccessMessageConstant.AiModelsRetrievedSuccessfully));
        }

        [HttpGet(ApiEndpointConstant.AiModelAdmin.GetPaginated)]
        [ProducesResponseType(typeof(ApiResponse<PaginationResponse<AiModelConfigDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaginated([FromQuery] AiModelConfigFilterDto filter, CancellationToken cancellationToken)
        {
            var items = await _aiModelConfigService.GetPaginatedListAsync(filter, cancellationToken);
            return Ok(ApiResponse<PaginationResponse<AiModelConfigDto>>.Success(items, SuccessMessageConstant.AiModelsRetrievedSuccessfully));
        }

        [HttpPost(ApiEndpointConstant.AiModelAdmin.Create)]
        [ProducesResponseType(typeof(ApiResponse<AiModelConfigDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Create([FromBody] CreateAiModelConfigDto dto, CancellationToken cancellationToken)
        {
            var item = await _aiModelConfigService.CreateAsync(dto, cancellationToken);
            return CreatedAtAction(
                nameof(GetById),
                new { id = item.Id },
                ApiResponse<AiModelConfigDto>.Success(item, SuccessMessageConstant.AiModelCreatedSuccessfully, StatusCodes.Status201Created)
            );
        }

        [HttpPut(ApiEndpointConstant.AiModelAdmin.Update)]
        [ProducesResponseType(typeof(ApiResponse<AiModelConfigDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateAiModelConfigDto dto, CancellationToken cancellationToken)
        {
            var item = await _aiModelConfigService.UpdateAsync(id, dto, cancellationToken);
            return Ok(ApiResponse<AiModelConfigDto>.Success(item, SuccessMessageConstant.AiModelUpdatedSuccessfully));
        }

        [HttpDelete(ApiEndpointConstant.AiModelAdmin.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] string id, CancellationToken cancellationToken)
        {
            await _aiModelConfigService.DeleteAsync(id, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.AiModelDeletedSuccessfully));
        }
    }
}
