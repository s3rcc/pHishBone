using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.Auth;
using Application.DTOs.AuthDTOs;
using Application.DTOs.PBUserDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace pHishbone.Controllers
{
    [ApiController]
    [Route(ApiEndpointConstant.Auth.Base)]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _authService;
        private readonly IUserService _userService;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IAuthService authService,
            IUserService userService,
            ICurrentUserService currentUserService,
            ILogger<AuthController> logger)
        {
            _authService = authService;
            _userService = userService;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        /// <summary>
        /// Register a new user account
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.Register)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
        {
            var result = await _authService.RegisterAsync(request, cancellationToken);
            return StatusCode(
                StatusCodes.Status201Created,
                ApiResponse<LoginResponseDto>.Success(result, SuccessMessageConstant.UserRegisteredSuccessfully, 201)
            );
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.Login)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
        {
            var result = await _authService.LoginAsync(request, cancellationToken);
            return Ok(ApiResponse<LoginResponseDto>.Success(result, SuccessMessageConstant.LoginSuccessful));
        }

        /// <summary>
        /// Refresh access token using refresh token
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.Refresh)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto dto, CancellationToken cancellationToken)
        {
            var response = await _authService.RefreshTokenAsync(dto.RefreshToken, cancellationToken);
            return Ok(ApiResponse<LoginResponseDto>.Success(response, SuccessMessageConstant.TokenRefreshedSuccessfully));
        }

        /// <summary>
        /// Get current authenticated user's information
        /// </summary>
        [HttpGet(ApiEndpointConstant.Auth.Me)]
        [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> GetCurrentUser(CancellationToken cancellationToken)
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

            var user = await _authService.GetCurrentUserAsync(userId, cancellationToken);
            return Ok(ApiResponse<UserDto>.Success(user, SuccessMessageConstant.UserRetrievedSuccessfully));
        }

        /// <summary>
        /// Logout current authenticated user and invalidate the access token.
        /// </summary>
        [Authorize]
        [HttpPost(ApiEndpointConstant.Auth.Logout)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Logout(CancellationToken cancellationToken)
        {
            // Extract the raw token from the Authorization header so the service can blacklist it
            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            var accessToken = authHeader?.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) == true
                ? authHeader["Bearer ".Length..].Trim()
                : string.Empty;

            await _authService.LogoutAsync(accessToken, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.LogoutSuccessful));
        }

        /// <summary>
        /// Request password reset email
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.ForgotPassword)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request, CancellationToken cancellationToken)
        {
            await _authService.ForgotPasswordAsync(request, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.PasswordResetEmailSent));
        }

        /// <summary>
        /// Reset password using reset code from email
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.ResetPassword)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request, CancellationToken cancellationToken)
        {
            await _authService.ResetPasswordAsync(request, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.PasswordChangedSuccessfully));
        }

        /// <summary>
        /// Change password for authenticated user
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.ChangePassword)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequestDto request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Error(
                    "User not authenticated",
                    "User not authenticated"
                ));
            }

            await _authService.ChangePasswordAsync(request, userId, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.PasswordChangedSuccessfully));
        }

        /// <summary>
        /// Verify email with verification token
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.VerifyEmail)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> VerifyEmail([FromBody] VerifyEmailRequestDto request, CancellationToken cancellationToken)
        {
            await _authService.VerifyEmailAsync(request, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.EmailVerifiedSuccessfully));
        }

        /// <summary>
        /// Resend verification email
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.ResendVerification)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> ResendVerification([FromBody] ResendVerificationRequestDto request, CancellationToken cancellationToken)
        {
            await _authService.ResendVerificationEmailAsync(request, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, SuccessMessageConstant.EmailVerificationSent));
        }

        // ─────────────────────────────────────────────────────────────
        // User Profile Endpoints
        // ─────────────────────────────────────────────────────────────

        /// <summary>
        /// Update the current user's profile (username).
        /// </summary>
        [Authorize]
        [HttpPut(ApiEndpointConstant.Auth.Me)]
        [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequestDto request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Error("User not authenticated", "User not authenticated"));
            }

            var result = await _userService.UpdateProfileAsync(request, userId, cancellationToken);
            return Ok(ApiResponse<UserDto>.Success(result, SuccessMessageConstant.ProfileUpdatedSuccessfully));
        }

        /// <summary>
        /// Upload or replace the current user's avatar image.
        /// </summary>
        [Authorize]
        [HttpPost(ApiEndpointConstant.Auth.MeAvatar)]
        [Consumes("multipart/form-data")]
        [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> UploadAvatar(IFormFile file, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Error("User not authenticated", "User not authenticated"));
            }

            var result = await _userService.UploadAvatarAsync(file, userId, cancellationToken);
            return Ok(ApiResponse<UserDto>.Success(result, SuccessMessageConstant.AvatarUploadedSuccessfully));
        }

        /// <summary>
        /// Request an email change. Supabase sends a confirmation email to both old and new addresses.
        /// </summary>
        [Authorize]
        [HttpPost(ApiEndpointConstant.Auth.ChangeEmail)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> ChangeEmail([FromBody] ChangeEmailRequestDto request, CancellationToken cancellationToken)
        {
            var userId = _currentUserService.GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized(ApiResponse<object>.Error("User not authenticated", "User not authenticated"));
            }

            var message = await _userService.ChangeEmailAsync(request, userId, cancellationToken);
            return Ok(ApiResponse<object>.Success(null, message));
        }
    }
}
