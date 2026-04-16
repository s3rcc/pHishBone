using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.AiDTOs;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Route(ApiEndpointConstant.AiModel.Base)]
    public class AiModelSelectionController : ControllerBase
    {
        private readonly IAiModelConfigService _aiModelConfigService;

        public AiModelSelectionController(IAiModelConfigService aiModelConfigService)
        {
            _aiModelConfigService = aiModelConfigService;
        }

        [HttpGet(ApiEndpointConstant.AiModel.Available)]
        [ProducesResponseType(typeof(ApiResponse<ICollection<AiModelConfigDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetAvailable(CancellationToken cancellationToken)
        {
            var items = await _aiModelConfigService.GetAvailableAsync(cancellationToken);
            return Ok(ApiResponse<ICollection<AiModelConfigDto>>.Success(items, SuccessMessageConstant.AiModelsRetrievedSuccessfully));
        }

        [HttpGet(ApiEndpointConstant.AiModel.Default)]
        [ProducesResponseType(typeof(ApiResponse<AiModelConfigDto>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetDefault(CancellationToken cancellationToken)
        {
            var item = await _aiModelConfigService.GetDefaultAsync(cancellationToken);
            return Ok(ApiResponse<AiModelConfigDto>.Success(item, SuccessMessageConstant.AiModelRetrievedSuccessfully));
        }
    }
}
