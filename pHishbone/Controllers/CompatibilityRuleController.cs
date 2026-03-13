using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Route(ApiEndpointConstant.CompatibilityRule.Base)]
    public class CompatibilityRuleController : ControllerBase
    {
        private readonly ICompatibilityRuleService _ruleService;
        private readonly ILogger<CompatibilityRuleController> _logger;

        public CompatibilityRuleController(
            ICompatibilityRuleService ruleService,
            ILogger<CompatibilityRuleController> logger)
        {
            _ruleService = ruleService;
            _logger = logger;
        }

        /// <summary>
        /// Get a compatibility rule by ID
        /// </summary>
        [HttpGet(ApiEndpointConstant.CompatibilityRule.GetById)]
        [ProducesResponseType(typeof(ApiResponse<CompatibilityRuleDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetById([FromRoute] string id)
        {
            var rule = await _ruleService.GetByIdAsync(id);
            return Ok(ApiResponse<CompatibilityRuleDto>.Success(rule, SuccessMessageConstant.RuleRetrievedSuccessfully));
        }

        /// <summary>
        /// Get paginated compatibility rules with search
        /// </summary>
        [HttpGet(ApiEndpointConstant.CompatibilityRule.GetPaginated)]
        [ProducesResponseType(typeof(ApiResponse<PaginationResponse<CompatibilityRuleDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaginated([FromQuery] CompatibilityRuleFilterDto filter)
        {
            var rules = await _ruleService.GetPaginatedListAsync(filter);
            return Ok(ApiResponse<PaginationResponse<CompatibilityRuleDto>>.Success(rules, SuccessMessageConstant.RulesRetrievedSuccessfully));
        }

        /// <summary>
        /// Create a new compatibility rule between two tags
        /// </summary>
        [HttpPost(ApiEndpointConstant.CompatibilityRule.Create)]
        [ProducesResponseType(typeof(ApiResponse<CompatibilityRuleDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Create([FromBody] CreateCompatibilityRuleDto dto)
        {
            _logger.LogInformation("Creating compatibility rule: {SubjectTagId} → {ObjectTagId}", dto.SubjectTagId, dto.ObjectTagId);
            var rule = await _ruleService.CreateAsync(dto);
            return CreatedAtAction(
                nameof(GetById),
                new { id = rule.Id },
                ApiResponse<CompatibilityRuleDto>.Success(rule, SuccessMessageConstant.RuleCreatedSuccessfully, 201)
            );
        }

        /// <summary>
        /// Update an existing compatibility rule (Severity and Message only)
        /// </summary>
        [HttpPut(ApiEndpointConstant.CompatibilityRule.Update)]
        [ProducesResponseType(typeof(ApiResponse<CompatibilityRuleDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Update([FromRoute] string id, [FromBody] UpdateCompatibilityRuleDto dto)
        {
            _logger.LogInformation("Updating compatibility rule {RuleId}", id);
            var rule = await _ruleService.UpdateAsync(id, dto);
            return Ok(ApiResponse<CompatibilityRuleDto>.Success(rule, SuccessMessageConstant.RuleUpdatedSuccessfully));
        }

        /// <summary>
        /// Delete a compatibility rule
        /// </summary>
        [HttpDelete(ApiEndpointConstant.CompatibilityRule.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> Delete([FromRoute] string id)
        {
            _logger.LogInformation("Deleting compatibility rule {RuleId}", id);
            await _ruleService.DeleteAsync(id);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.RuleDeletedSuccessfully));
        }
    }
}
