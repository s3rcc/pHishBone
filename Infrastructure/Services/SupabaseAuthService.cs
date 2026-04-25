using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.Auth;
using AutoMapper;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using System.IdentityModel.Tokens.Jwt;

namespace Infrastructure.Services
{
    public class SupabaseAuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly Supabase.Client _supabaseClient;
        private readonly ILogger<SupabaseAuthService> _logger;
        private readonly ITokenBlacklistService _tokenBlacklist;

        public SupabaseAuthService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            Supabase.Client supabaseClient,
            ILogger<SupabaseAuthService> logger,
            ITokenBlacklistService tokenBlacklist)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _supabaseClient = supabaseClient;
            _logger = logger;
            _tokenBlacklist = tokenBlacklist;
        }

        public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Attempting to register user with email: {Email}", request.Email);

            var existingUser = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.Email == request.Email && u.DeletedTime == null, cancellationToken: cancellationToken);

            if (existingUser != null)
            {
                _logger.LogWarning("User with email {Email} already exists", request.Email);
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    ErrorMessageConstant.DuplicateEmail);
            }

            var existingUserName = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.Username == request.Username && u.DeletedTime == null, cancellationToken: cancellationToken);

            if (existingUserName != null)
            {
                _logger.LogWarning("User with username {UserName} already exists", request.Username);
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    ErrorMessageConstant.DuplicateUserName);
            }

            // Register user in Supabase Auth
            var authResponse = await _supabaseClient.Auth.SignUp(request.Email, request.Password).WaitAsync(cancellationToken);

            if (authResponse?.User == null)
            {
                _logger.LogError("Failed to create user in Supabase Auth for email: {Email}", request.Email);
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    "Failed to create user account");
            }

            // Create user in local database
            var user = new PBUser
            {
                Username = request.Username,
                Email = request.Email,
                SupabaseUserId = authResponse.User.Id,
                Role = Domain.Enums.Role.Member,
                CreatedBy = authResponse.User.Id
            };

            await _unitOfWork.Repository<PBUser>().InsertAsync(user, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Successfully registered user with email: {Email}, UserId: {UserId}",
                request.Email, user.Id);

            // Map response
            var userDto = _mapper.Map<UserDto>(user);

            return new LoginResponseDto
            {
                AccessToken = authResponse.AccessToken ?? string.Empty,
                RefreshToken = authResponse.RefreshToken ?? string.Empty,
                ExpiresIn = authResponse.ExpiresIn,
                User = userDto
            };
        }

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Attempting login for email: {Email}", request.Email);

            // Authenticate with Supabase
            var authResponse = await _supabaseClient.Auth.SignIn(request.Email, request.Password).WaitAsync(cancellationToken);

            if (authResponse?.User == null)
            {
                _logger.LogWarning("Failed login attempt for email: {Email} - Invalid credentials", request.Email);
                throw new CustomErrorException(StatusCodes.Status401Unauthorized, ErrorCode.UNAUTHORIZED, ErrorMessageConstant.InvalidCredentials);
            }

            // Get user from local database
            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.SupabaseUserId == authResponse.User.Id, cancellationToken: cancellationToken);

            if (user == null)
            {
                _logger.LogError("User authenticated in Supabase but not found in local database. SupabaseUserId: {SupabaseUserId}",
                    authResponse.User.Id);
                throw new CustomErrorException(StatusCodes.Status404NotFound, ErrorCode.NOT_FOUND, ErrorMessageConstant.UserNotFound);
            }

            _logger.LogInformation("Successful login for email: {Email}, UserId: {UserId}", request.Email, user.Id);

            // Map response
            var userDto = _mapper.Map<UserDto>(user);

            return new LoginResponseDto
            {
                AccessToken = authResponse.AccessToken ?? string.Empty,
                RefreshToken = authResponse.RefreshToken ?? string.Empty,
                ExpiresIn = authResponse.ExpiresIn,
                User = userDto
            };
        }

        public async Task<LoginResponseDto> RefreshTokenAsync(string accessToken, string refreshToken, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Attempting to refresh token");

            if (string.IsNullOrWhiteSpace(refreshToken))
            {
                _logger.LogWarning("Refresh token request rejected because the refresh token was missing");
                throw new CustomErrorException(
                    StatusCodes.Status401Unauthorized,
                    ErrorCode.UNAUTHORIZED,
                    ErrorMessageConstant.InvalidRefreshToken);
            }

            if (string.IsNullOrWhiteSpace(accessToken))
            {
                _logger.LogWarning("Refresh token request rejected because the access token transport cookie was missing");
                throw new CustomErrorException(
                    StatusCodes.Status401Unauthorized,
                    ErrorCode.UNAUTHORIZED,
                    ErrorMessageConstant.MissingRefreshSession);
            }

            var session = await _supabaseClient.Auth
                .SetSession(accessToken, refreshToken, true)
                .WaitAsync(cancellationToken);

            if (session?.User == null)
            {
                _logger.LogWarning("Failed to refresh token - Invalid refresh token");
                throw new CustomErrorException(
                    StatusCodes.Status401Unauthorized,
                    ErrorCode.UNAUTHORIZED,
                    ErrorMessageConstant.InvalidRefreshToken);
            }

            // Get user from local database
            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.SupabaseUserId == session.User.Id, cancellationToken: cancellationToken);

            if (user == null)
            {
                _logger.LogError("User not found in local database. SupabaseUserId: {SupabaseUserId}",
                    session.User.Id);
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ErrorMessageConstant.UserNotFound);
            }

            _logger.LogInformation("Successfully refreshed token for user: {UserId}", user.Id);

            var userDto = _mapper.Map<UserDto>(user);

            return new LoginResponseDto
            {
                AccessToken = session.AccessToken ?? string.Empty,
                RefreshToken = session.RefreshToken ?? string.Empty,
                ExpiresIn = session.ExpiresIn,
                User = userDto
            };
        }

        public async Task<UserDto> GetCurrentUserAsync(string userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Getting current user: {UserId}", userId);

            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.SupabaseUserId == userId, cancellationToken: cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found: {UserId}", userId);
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ErrorMessageConstant.UserNotFound);
            }

            return _mapper.Map<UserDto>(user);
        }

        public async Task ForgotPasswordAsync(ForgotPasswordRequestDto request, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Password reset requested for email: {Email}", request.Email);

            try
            {
                // Send password reset email via Supabase
                await _supabaseClient.Auth.ResetPasswordForEmail(request.Email).WaitAsync(cancellationToken);

                _logger.LogInformation("Password reset email sent successfully to: {Email}", request.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to send password reset email to: {Email}", request.Email);
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    ErrorMessageConstant.PasswordResetFailed);
            }
        }

        public async Task ResetPasswordAsync(ResetPasswordRequestDto request, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Attempting to reset password for email: {Email}", request.Email);

            try
            {
                // Verify the reset token (OTP)
                var session = await _supabaseClient.Auth.VerifyOTP(
                    request.Email,
                    request.Code,
                    Supabase.Gotrue.Constants.EmailOtpType.Recovery).WaitAsync(cancellationToken);

                if (session?.User == null)
                {
                    _logger.LogWarning("Invalid reset code for email: {Email}", request.Email);
                    throw new CustomErrorException(
                        StatusCodes.Status400BadRequest,
                        ErrorCode.BADREQUEST,
                        ErrorMessageConstant.InvalidResetToken);
                }

                // Update user's password
                var userAttributes = new Supabase.Gotrue.UserAttributes
                {
                    Password = request.Password
                };

                await _supabaseClient.Auth.Update(userAttributes).WaitAsync(cancellationToken);

                _logger.LogInformation("Password reset successfully for email: {Email}", request.Email);
            }
            catch (CustomErrorException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to reset password for email: {Email}", request.Email);
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    ErrorMessageConstant.PasswordResetFailed);
            }
        }

        public async Task ChangePasswordAsync(ChangePasswordRequestDto request, string userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Attempting to change password for user: {UserId}", userId);

            try
            {
                // Verify current password by attempting to sign in
                var user = await _unitOfWork.Repository<PBUser>()
                    .SingleOrDefaultAsync(predicate: u => u.Id == userId, cancellationToken: cancellationToken);

                if (user == null)
                {
                    _logger.LogWarning("User not found: {UserId}", userId);
                    throw new CustomErrorException(
                        StatusCodes.Status404NotFound,
                        ErrorCode.NOT_FOUND,
                        ErrorMessageConstant.UserNotFound);
                }

                // Verify current password
                try
                {
                    await _supabaseClient.Auth.SignIn(user.Email, request.CurrentPassword).WaitAsync(cancellationToken);
                }
                catch
                {
                    _logger.LogWarning("Invalid current password for user: {UserId}", userId);
                    throw new CustomErrorException(
                        StatusCodes.Status401Unauthorized,
                        ErrorCode.UNAUTHORIZED,
                        "Current password is incorrect");
                }

                // Update to new password
                var userAttributes = new Supabase.Gotrue.UserAttributes
                {
                    Password = request.NewPassword
                };

                await _supabaseClient.Auth.Update(userAttributes).WaitAsync(cancellationToken);

                _logger.LogInformation("Password changed successfully for user: {UserId}", userId);
            }
            catch (CustomErrorException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to change password for user: {UserId}", userId);
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    ErrorMessageConstant.PasswordChangeFailed);
            }
        }

        public async Task VerifyEmailAsync(VerifyEmailRequestDto request, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Attempting to verify email: {Email}", request.Email);

            try
            {
                // Verify OTP
                var session = await _supabaseClient.Auth.VerifyOTP(
                    request.Email,
                    request.Token,
                    Supabase.Gotrue.Constants.EmailOtpType.Signup).WaitAsync(cancellationToken);

                if (session?.User == null)
                {
                    _logger.LogWarning("Invalid verification token for email: {Email}", request.Email);
                    throw new CustomErrorException(
                        StatusCodes.Status400BadRequest,
                        ErrorCode.BADREQUEST,
                        ErrorMessageConstant.InvalidVerificationToken);
                }

                _logger.LogInformation("Email verified successfully: {Email}", request.Email);
            }
            catch (CustomErrorException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to verify email: {Email}", request.Email);
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    ErrorMessageConstant.EmailVerificationFailed);
            }
        }

        public async Task ResendVerificationEmailAsync(ResendVerificationRequestDto request, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Resending verification email to: {Email}", request.Email);

            try
            {
                // Resend signup confirmation email
                await _supabaseClient.Auth.ResetPasswordForEmail(request.Email).WaitAsync(cancellationToken);

                _logger.LogInformation("Verification email resent successfully to: {Email}", request.Email);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to resend verification email to: {Email}", request.Email);
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    "Failed to resend verification email");
            }
        }

        public async Task LogoutAsync(string accessToken, string refreshToken, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Attempting to logout user and blacklist token");

            try
            {
                // Decode token (no validation — it was already validated by the JWT pipeline)
                var handler = new JwtSecurityTokenHandler();
                string? jti = null;
                TimeSpan ttl = TimeSpan.FromMinutes(60); // safe fallback

                if (!string.IsNullOrEmpty(accessToken) && handler.CanReadToken(accessToken))
                {
                    var jwt = handler.ReadJwtToken(accessToken);
                    jti = jwt.Id; // 'jti' claim

                    var expiry = jwt.ValidTo; // UTC datetime
                    var remaining = expiry - DateTime.UtcNow;
                    ttl = remaining > TimeSpan.Zero ? remaining : TimeSpan.FromSeconds(30);

                    _logger.LogInformation(
                        "Token decoded for blacklisting. Jti: {Jti}, ExpiresAt: {ExpiresAt}, RemainingTtl: {Ttl}",
                        jti, expiry, ttl);
                }
                else
                {
                    _logger.LogWarning("Logout called with missing or unreadable access token — skipping blacklist step");
                }

                // Blacklist the token in Redis
                if (jti != null)
                    await _tokenBlacklist.BlacklistTokenAsync(jti, ttl, cancellationToken);

                if (!string.IsNullOrWhiteSpace(accessToken) && !string.IsNullOrWhiteSpace(refreshToken))
                {
                    try
                    {
                        await _supabaseClient.Auth.SetSession(accessToken, refreshToken, true).WaitAsync(cancellationToken);
                        await _supabaseClient.Auth.SignOut().WaitAsync(cancellationToken);
                    }
                    catch (Exception ex)
                    {
                        _logger.LogWarning(ex, "Failed to invalidate Supabase session during logout");
                    }
                }
                else
                {
                    _logger.LogWarning("Logout called without a complete Supabase session cookie set");
                }

                _logger.LogInformation("User logged out successfully. Jti: {Jti}", jti);
            }
            catch (CustomErrorException)
            {
                throw;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to logout user");
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    ErrorMessageConstant.LogoutFailed);
            }
        }
    }
}

