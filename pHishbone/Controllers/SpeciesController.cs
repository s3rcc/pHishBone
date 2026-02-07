using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.CatalogDTOs;
using Application.DTOs.ImageDTOs;
using Application.Services;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Route(ApiEndpointConstant.Species.Base)]
    public class SpeciesController : ControllerBase
    {
        private readonly ISpeciesService _speciesService;
        private readonly ISpeciesImageService _speciesImageService;
        private readonly ILogger<SpeciesController> _logger;

        public SpeciesController(
            ISpeciesService speciesService, 
            ISpeciesImageService speciesImageService,
            ILogger<SpeciesController> logger)
        {
            _speciesService = speciesService;
            _speciesImageService = speciesImageService;
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
            return Ok(ApiResponse<SpeciesDto>.Success(species, SuccessMessageConstant.SpeciesRetrievedSuccessfully));
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
            return Ok(ApiResponse<SpeciesDetailDto>.Success(species, SuccessMessageConstant.SpeciesDetailsRetrievedSuccessfully));
        }

        /// <summary>
        /// Get all species
        /// </summary>
        [HttpGet(ApiEndpointConstant.Species.GetList)]
        [ProducesResponseType(typeof(ApiResponse<ICollection<SpeciesDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetList()
        {
            var species = await _speciesService.GetListAsync();
            return Ok(ApiResponse<ICollection<SpeciesDto>>.Success(species, SuccessMessageConstant.SpeciesListRetrievedSuccessfully));
        }

        /// <summary>
        /// Get paginated species with filtering and search
        /// </summary>
        [HttpGet(ApiEndpointConstant.Species.GetPaginated)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaginated([FromQuery] SpeciesFilterDto filter)
        {
            var species = await _speciesService.GetPaginatedListAsync(filter);
            return Ok(ApiResponse<object>.Success(species, SuccessMessageConstant.SpeciesRetrievedSuccessfully));
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
                ApiResponse<SpeciesDetailDto>.Success(species, SuccessMessageConstant.SpeciesCreatedSuccessfully, 201)
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
            return Ok(ApiResponse<SpeciesDetailDto>.Success(species, SuccessMessageConstant.SpeciesUpdatedSuccessfully));
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
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.SpeciesDeletedSuccessfully));
        }

        #region Image Endpoints

        /// <summary>
        /// Get all images for a species
        /// </summary>
        [HttpGet(ApiEndpointConstant.SpeciesImage.GetAll)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ImageResponseDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetImages([FromRoute] string id, CancellationToken cancellationToken)
        {
            var images = await _speciesImageService.GetImagesAsync(id, cancellationToken);
            return Ok(ApiResponse<IEnumerable<ImageResponseDto>>.Success(images, SuccessMessageConstant.ImagesRetrievedSuccessfully));
        }

        /// <summary>
        /// Add an image to a species gallery
        /// </summary>
        [HttpPost(ApiEndpointConstant.SpeciesImage.Add)]
        [ProducesResponseType(typeof(ApiResponse<ImageResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AddImage([FromRoute] string id, [FromBody] CreateImageDto dto, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Adding image to species {SpeciesId}", id);
            var image = await _speciesImageService.AddImageAsync(id, dto, cancellationToken);
            return StatusCode(StatusCodes.Status201Created,
                ApiResponse<ImageResponseDto>.Success(image, SuccessMessageConstant.ImageAddedSuccessfully, 201));
        }

        /// <summary>
        /// Remove an image from a species gallery
        /// </summary>
        [HttpDelete(ApiEndpointConstant.SpeciesImage.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveImage([FromRoute] string id, [FromRoute] string imageId, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Removing image {ImageId} from species {SpeciesId}", imageId, id);
            await _speciesImageService.RemoveImageAsync(id, imageId, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.ImageRemovedSuccessfully));
        }

        /// <summary>
        /// Set the main thumbnail image for a species
        /// </summary>
        [HttpPatch(ApiEndpointConstant.SpeciesImage.SetThumbnail)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetThumbnail([FromRoute] string id, [FromBody] SetThumbnailDto dto, CancellationToken cancellationToken)
        {
            await _speciesImageService.SetThumbnailAsync(id, dto, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.ThumbnailSetSuccessfully));
        }

        #endregion
    }
}

