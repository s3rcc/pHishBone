using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.ImageDTOs;
using Application.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    /// <summary>
    /// Controller for Tank image management operations.
    /// </summary>
    [ApiController]
    [Route(ApiEndpointConstant.TankImage.Base)]
    [Authorize]
    public class TankImageController : ControllerBase
    {
        private readonly ITankImageService _tankImageService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<TankImageController> _logger;

        public TankImageController(
            ITankImageService tankImageService,
            ICurrentUserService currentUserService,
            ILogger<TankImageController> logger)
        {
            _tankImageService = tankImageService;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        /// <summary>
        /// Get all images for a tank.
        /// </summary>
        [HttpGet(ApiEndpointConstant.TankImage.GetAll)]
        [ProducesResponseType(typeof(ApiResponse<IEnumerable<ImageResponseDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetImages([FromRoute] string tankId, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var images = await _tankImageService.GetImagesAsync(tankId, userId, cancellationToken);
            return Ok(ApiResponse<IEnumerable<ImageResponseDto>>.Success(images, SuccessMessageConstant.ImagesRetrievedSuccessfully));
        }

        /// <summary>
        /// Add a single image to a tank gallery via file upload.
        /// </summary>
        [HttpPost(ApiEndpointConstant.TankImage.Add)]
        [ProducesResponseType(typeof(ApiResponse<ImageResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AddImage([FromRoute] string tankId, [FromForm] CreateImageDto dto, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Adding image to tank {TankId}", tankId);

            var image = await _tankImageService.AddImageAsync(tankId, dto, userId, cancellationToken);
            return StatusCode(StatusCodes.Status201Created,
                ApiResponse<ImageResponseDto>.Success(image, SuccessMessageConstant.ImageAddedSuccessfully, 201));
        }

        /// <summary>
        /// Add multiple images to a tank gallery concurrently.
        /// </summary>
        [HttpPost(ApiEndpointConstant.TankImage.AddBatch)]
        [ProducesResponseType(typeof(ApiResponse<List<ImageResponseDto>>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> AddImages([FromRoute] string tankId, [FromForm] List<IFormFile> files, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Adding {Count} images to tank {TankId}", files.Count, tankId);

            var images = await _tankImageService.AddImagesAsync(tankId, files, userId, cancellationToken);
            return StatusCode(StatusCodes.Status201Created,
                ApiResponse<List<ImageResponseDto>>.Success(images, SuccessMessageConstant.ImageAddedSuccessfully, 201));
        }

        /// <summary>
        /// Remove an image from a tank gallery.
        /// </summary>
        [HttpDelete(ApiEndpointConstant.TankImage.Delete)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> RemoveImage([FromRoute] string tankId, [FromRoute] string imageId, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            _logger.LogInformation("Removing image {ImageId} from tank {TankId}", imageId, tankId);

            await _tankImageService.RemoveImageAsync(tankId, imageId, userId, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.ImageRemovedSuccessfully));
        }

        /// <summary>
        /// Set the main thumbnail image for a tank via file upload.
        /// </summary>
        [HttpPatch(ApiEndpointConstant.TankImage.SetThumbnail)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> SetThumbnail([FromRoute] string tankId, [FromForm] SetThumbnailDto dto, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            await _tankImageService.SetThumbnailAsync(tankId, dto, userId, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.ThumbnailSetSuccessfully));
        }
    }
}
