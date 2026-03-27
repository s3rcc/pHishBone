using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.AiDTOs;
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
        private readonly IAiFishInformationService _aiFishInformationService;
        private readonly ILogger<SpeciesController> _logger;

        public SpeciesController(
            ISpeciesService speciesService, 
            ISpeciesImageService speciesImageService,
            IAiFishInformationService aiFishInformationService,
            ILogger<SpeciesController> logger)
        {
            _speciesService = speciesService;
            _speciesImageService = speciesImageService;
            _aiFishInformationService = aiFishInformationService;
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
        [ProducesResponseType(typeof(ApiResponse<PaginationResponse<SpeciesDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> GetPaginated([FromQuery] SpeciesFilterDto filter)
        {
            var species = await _speciesService.GetPaginatedListAsync(filter);
            return Ok(ApiResponse<PaginationResponse<SpeciesDto>>.Success(species, SuccessMessageConstant.SpeciesRetrievedSuccessfully));
        }

        /// <summary>
        /// Get full species details by slug for public catalog SEO-friendly URLs
        /// </summary>
        [HttpGet(ApiEndpointConstant.Species.GetBySlug)]
        [ProducesResponseType(typeof(ApiResponse<SpeciesDetailDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> GetBySlug([FromRoute] string slug)
        {
            var species = await _speciesService.GetDetailBySlugAsync(slug);
            return Ok(ApiResponse<SpeciesDetailDto>.Success(species, SuccessMessageConstant.SpeciesDetailsRetrievedSuccessfully));
        }

        /// <summary>
        /// Bilingual hybrid search (FTS + Trigram). Handles Vietnamese, English, scientific names, and typos.
        /// Returns paginated results ranked by relevance.
        /// </summary>
        [HttpGet(ApiEndpointConstant.Species.Search)]
        [ProducesResponseType(typeof(ApiResponse<PaginationResponse<SpeciesDto>>), StatusCodes.Status200OK)]
        public async Task<IActionResult> Search([FromQuery] SpeciesFilterDto filter, CancellationToken cancellationToken)
        {
            _logger.LogInformation("Species hybrid search requested with query: {Query}", filter.SearchTerm);
            var results = await _speciesService.SearchHybridAsync(filter, cancellationToken);
            return Ok(ApiResponse<PaginationResponse<SpeciesDto>>.Success(results, SuccessMessageConstant.SpeciesSearchRetrievedSuccessfully));
        }

        /// <summary>
        /// Generate preview-only fish information using the configured AI provider.
        /// Returns an existing species when an exact common or scientific name match already exists.
        /// </summary>
        [HttpPost(ApiEndpointConstant.Species.GenerateFishInformation)]
        [ProducesResponseType(typeof(ApiResponse<AiFishInformationResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GenerateFishInformation([FromBody] GenerateFishInformationRequestDto dto, CancellationToken cancellationToken)
        {
            var result = await _aiFishInformationService.GenerateFishInformationAsync(dto, cancellationToken);
            return Ok(ApiResponse<AiFishInformationResponseDto>.Success(result, SuccessMessageConstant.AiFishInformationGeneratedSuccessfully));
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
        public async Task<IActionResult> GetImages([FromRoute] string id)
        {
            var images = await _speciesImageService.GetImagesAsync(id);
            return Ok(ApiResponse<IEnumerable<ImageResponseDto>>.Success(images, SuccessMessageConstant.ImagesRetrievedSuccessfully));
        }

        /// <summary>
        /// Add a single image to a species gallery via file upload
        /// </summary>
        [HttpPost(ApiEndpointConstant.SpeciesImage.Add)]
        [ProducesResponseType(typeof(ApiResponse<ImageResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AddImage([FromRoute] string id, [FromForm] CreateImageDto dto)
        {
            _logger.LogInformation("Adding image to species {SpeciesId}", id);
            var image = await _speciesImageService.AddImageAsync(id, dto);
            return StatusCode(StatusCodes.Status201Created,
                ApiResponse<ImageResponseDto>.Success(image, SuccessMessageConstant.ImageAddedSuccessfully, 201));
        }

        /// <summary>
        /// Add multiple images to a species gallery concurrently
        /// </summary>
        [HttpPost(ApiEndpointConstant.SpeciesImage.AddBatch)]
        [ProducesResponseType(typeof(ApiResponse<List<ImageResponseDto>>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> AddImages([FromRoute] string id, [FromForm] List<IFormFile> files)
        {
            _logger.LogInformation("Adding {Count} images to species {SpeciesId}", files.Count, id);
            var images = await _speciesImageService.AddImagesAsync(id, files);
            return StatusCode(StatusCodes.Status201Created,
                ApiResponse<List<ImageResponseDto>>.Success(images, SuccessMessageConstant.ImageAddedSuccessfully, 201));
        }

        /// <summary>
        /// Remove an image from a species gallery
        /// </summary>
        [HttpDelete(ApiEndpointConstant.SpeciesImage.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> RemoveImage([FromRoute] string id, [FromRoute] string imageId)
        {
            _logger.LogInformation("Removing image {ImageId} from species {SpeciesId}", imageId, id);
            await _speciesImageService.RemoveImageAsync(id, imageId);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.ImageRemovedSuccessfully));
        }

        /// <summary>
        /// Set the main thumbnail image for a species via file upload
        /// </summary>
        [HttpPatch(ApiEndpointConstant.SpeciesImage.SetThumbnail)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> SetThumbnail([FromRoute] string id, [FromForm] SetThumbnailDto dto)
        {
            await _speciesImageService.SetThumbnailAsync(id, dto);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.ThumbnailSetSuccessfully));
        }

        #endregion
    }
}
