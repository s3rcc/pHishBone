using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.Auth;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Route(ApiEndpointConstant.Auth.Base)]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            ICurrentUserService currentUserService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new user account
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.Register)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var result = await _authService.RegisterAsync(request);
            return StatusCode(
                StatusCodes.Status201Created,
                ApiResponse<LoginResponseDto>.Success(result, "User registered successfully", 201)
            );
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.Login)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var result = await _authService.LoginAsync(request);
            return Ok(ApiResponse<LoginResponseDto>.Success(result, "Login successful"));
        }

        /// <summary>
        /// Refresh access token using refresh token
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.Refresh)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto dto)
        {
            var response = await _authService.RefreshTokenAsync(dto.RefreshToken);
            return Ok(ApiResponse<LoginResponseDto>.Success(response, "Token refreshed successfully"));
        }

        /// <summary>
        /// Get current authenticated user's information
        /// </summary>
        [HttpGet(ApiEndpointConstant.Auth.Me)]
        [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userId = _currentUserService.GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Error(
                    "User not authenticated",
                    //StatusCodes.Status401Unauthorized
                    "User not authenticated"
                ));
            }

            var user = await _authService.GetCurrentUserAsync(userId);
            return Ok(ApiResponse<UserDto>.Success(user, "User retrieved successfully"));
        }
    }

    /// <summary>
    /// DTO for refresh token request
    /// </summary>
    public class RefreshTokenRequestDto
    {
        public string RefreshToken { get; set; } = string.Empty;
    }
}
