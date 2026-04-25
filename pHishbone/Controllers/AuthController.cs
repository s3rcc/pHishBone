using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.Auth;
using Application.DTOs.AuthDTOs;
using Application.DTOs.PBUserDTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

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
        [EnableRateLimiting(RateLimitConstant.AuthPolicy)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status201Created)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status400BadRequest)]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request, CancellationToken cancellationToken)
        {
            var result = await _authService.RegisterAsync(request, cancellationToken);
            WriteAuthCookies(result);
            return StatusCode(
                StatusCodes.Status201Created,
                ApiResponse<LoginResponseDto>.Success(SanitizeAuthResponse(result), SuccessMessageConstant.UserRegisteredSuccessfully, 201)
            );
        }

        /// <summary>
        /// Login with email and password
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.Login)]
        [EnableRateLimiting(RateLimitConstant.AuthPolicy)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request, CancellationToken cancellationToken)
        {
            var result = await _authService.LoginAsync(request, cancellationToken);
            WriteAuthCookies(result);
            return Ok(ApiResponse<LoginResponseDto>.Success(SanitizeAuthResponse(result), SuccessMessageConstant.LoginSuccessful));
        }

        /// <summary>
        /// Refresh access token using refresh token
        /// </summary>
        [HttpPost(ApiEndpointConstant.Auth.Refresh)]
        [ProducesResponseType(typeof(ApiResponse<LoginResponseDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status401Unauthorized)]
        public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto? dto, CancellationToken cancellationToken)
        {
            var accessToken = ResolveAccessToken(dto?.AccessToken);
            var refreshToken = ResolveRefreshToken(dto?.RefreshToken);

            var response = await _authService.RefreshTokenAsync(accessToken, refreshToken, cancellationToken);
            WriteAuthCookies(response);

            return Ok(ApiResponse<LoginResponseDto>.Success(SanitizeAuthResponse(response), SuccessMessageConstant.TokenRefreshedSuccessfully));
        }

        /// <summary>
        /// Get current authenticated user's information
        /// </summary>
        [Authorize]
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
            var accessToken = ResolveAccessToken();
            var refreshToken = ResolveRefreshToken();

            try
            {
                await _authService.LogoutAsync(accessToken, refreshToken, cancellationToken);
            }
            finally
            {
                ClearAuthCookies();
            }

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
        [Authorize]
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

        /// <summary>
        /// Get all users for admin role management.
        /// </summary>
        [Authorize(Roles = AuthorizationConstant.AdminRole)]
        [HttpGet(ApiEndpointConstant.Auth.Users)]
        [ProducesResponseType(typeof(ApiResponse<ICollection<UserDto>>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        public async Task<IActionResult> GetUsers(CancellationToken cancellationToken)
        {
            var users = await _userService.GetUsersAsync(cancellationToken);
            return Ok(ApiResponse<ICollection<UserDto>>.Success(users, SuccessMessageConstant.UsersRetrievedSuccessfully));
        }

        /// <summary>
        /// Update a user's role. Admin only.
        /// </summary>
        [Authorize(Roles = AuthorizationConstant.AdminRole)]
        [HttpPut(ApiEndpointConstant.Auth.UserRole)]
        [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status403Forbidden)]
        [ProducesResponseType(typeof(ApiResponse<object>), StatusCodes.Status404NotFound)]
        public async Task<IActionResult> UpdateUserRole(
            [FromRoute] string id,
            [FromBody] UpdateUserRoleRequestDto request,
            CancellationToken cancellationToken)
        {
            var user = await _userService.UpdateUserRoleAsync(id, request, cancellationToken);
            return Ok(ApiResponse<UserDto>.Success(user, SuccessMessageConstant.UserRoleUpdatedSuccessfully));
        }

        private string ResolveAccessToken(string? dtoAccessToken = null)
        {
            if (!string.IsNullOrWhiteSpace(dtoAccessToken))
            {
                return dtoAccessToken;
            }

            var authHeader = Request.Headers["Authorization"].FirstOrDefault();
            if (authHeader?.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase) == true)
            {
                return authHeader["Bearer ".Length..].Trim();
            }

            return Request.Cookies.TryGetValue(AuthCookieConstant.AccessTokenCookieName, out var cookieAccessToken)
                ? cookieAccessToken
                : string.Empty;
        }

        private string ResolveRefreshToken(string? dtoRefreshToken = null)
        {
            if (!string.IsNullOrWhiteSpace(dtoRefreshToken))
            {
                return dtoRefreshToken;
            }

            return Request.Cookies.TryGetValue(AuthCookieConstant.RefreshTokenCookieName, out var cookieRefreshToken)
                ? cookieRefreshToken
                : string.Empty;
        }

        private void WriteAuthCookies(LoginResponseDto response)
        {
            var expiresAt = DateTimeOffset.UtcNow.AddDays(AuthCookieConstant.AuthCookieLifetimeInDays);

            Response.Cookies.Append(
                AuthCookieConstant.AccessTokenCookieName,
                response.AccessToken,
                BuildCookieOptions(expiresAt));

            if (!string.IsNullOrWhiteSpace(response.RefreshToken))
            {
                Response.Cookies.Append(
                    AuthCookieConstant.RefreshTokenCookieName,
                    response.RefreshToken,
                    BuildCookieOptions(expiresAt));
            }
        }

        private void ClearAuthCookies()
        {
            Response.Cookies.Delete(AuthCookieConstant.AccessTokenCookieName, BuildCookieOptions(DateTimeOffset.UnixEpoch));
            Response.Cookies.Delete(AuthCookieConstant.RefreshTokenCookieName, BuildCookieOptions(DateTimeOffset.UnixEpoch));
        }

        private CookieOptions BuildCookieOptions(DateTimeOffset expiresAt)
        {
            return new CookieOptions
            {
                HttpOnly = true,
                IsEssential = true,
                Path = "/",
                SameSite = SameSiteMode.Strict,
                Secure = Request.IsHttps,
                Expires = expiresAt
            };
        }

        private static LoginResponseDto SanitizeAuthResponse(LoginResponseDto response)
        {
            return new LoginResponseDto
            {
                AccessToken = string.Empty,
                RefreshToken = string.Empty,
                ExpiresIn = response.ExpiresIn,
                User = response.User
            };
        }
    }
}
