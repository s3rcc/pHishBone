using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.Auth;
using AutoMapper;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Supabase.Gotrue;
using Supabase.Gotrue.Interfaces;

namespace Infrastructure.Services
{
    public class SupabaseAuthService : IAuthService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly Supabase.Client _supabaseClient;
        private readonly ILogger<SupabaseAuthService> _logger;

        public SupabaseAuthService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            Supabase.Client supabaseClient,
            ILogger<SupabaseAuthService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _supabaseClient = supabaseClient;
            _logger = logger;
        }

        public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            _logger.LogInformation("Attempting to register user with email: {Email}", request.Email);

            // Register user in Supabase Auth
            var authResponse = await _supabaseClient.Auth.SignUp(request.Email, request.Password);

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
                Role = Domain.Enums.Role.User, // Default role
                CreatedBy = authResponse.User.Id
            };

            await _unitOfWork.Repository<PBUser>().InsertAsync(user);
            await _unitOfWork.SaveChangesAsync();

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

        public async Task<LoginResponseDto> LoginAsync(LoginRequestDto request)
        {
            _logger.LogInformation("Attempting login for email: {Email}", request.Email);

            // Authenticate with Supabase
            var authResponse = await _supabaseClient.Auth.SignIn(request.Email, request.Password);

            if (authResponse?.User == null)
            {
                _logger.LogWarning("Failed login attempt for email: {Email} - Invalid credentials", request.Email);
                throw new CustomErrorException(StatusCodes.Status401Unauthorized, ErrorCode.UNAUTHORIZED, ErrorMessageConstant.InvalidCredentials);
            }

            // Get user from local database
            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.SupabaseUserId == authResponse.User.Id);

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

        public async Task<LoginResponseDto> RefreshTokenAsync(string refreshToken)
        {
            _logger.LogInformation("Attempting to refresh token");

            // Set the session with the refresh token, then refresh
            var session = await _supabaseClient.Auth.RefreshSession();

            if (session?.User == null)
            {
                _logger.LogWarning("Failed to refresh token - Invalid refresh token");
                throw new CustomErrorException(
                    StatusCodes.Status401Unauthorized,
                    ErrorCode.UNAUTHORIZED,
                    "Invalid or expired refresh token");
            }

            // Get user from local database
            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.SupabaseUserId == session.User.Id);

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

        public async Task<UserDto> GetCurrentUserAsync(string userId)
        {
            _logger.LogInformation("Getting current user: {UserId}", userId);

            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.Id == userId);

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

        public async Task ForgotPasswordAsync(ForgotPasswordRequestDto request)
        {
            _logger.LogInformation("Password reset requested for email: {Email}", request.Email);

            try
            {
                // Send password reset email via Supabase
                await _supabaseClient.Auth.ResetPasswordForEmail(request.Email);

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

        public async Task ResetPasswordAsync(ResetPasswordRequestDto request)
        {
            _logger.LogInformation("Attempting to reset password for email: {Email}", request.Email);

            try
            {
                // Verify the reset token (OTP)
                var session = await _supabaseClient.Auth.VerifyOTP(
                    request.Email,
                    request.Code,
                    Supabase.Gotrue.Constants.EmailOtpType.Recovery);

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

                await _supabaseClient.Auth.Update(userAttributes);

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

        public async Task ChangePasswordAsync(ChangePasswordRequestDto request, string userId)
        {
            _logger.LogInformation("Attempting to change password for user: {UserId}", userId);

            try
            {
                // Verify current password by attempting to sign in
                var user = await _unitOfWork.Repository<PBUser>()
                    .SingleOrDefaultAsync(predicate: u => u.Id == userId);

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
                    await _supabaseClient.Auth.SignIn(user.Email, request.CurrentPassword);
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

                await _supabaseClient.Auth.Update(userAttributes);

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

        public async Task VerifyEmailAsync(VerifyEmailRequestDto request)
        {
            _logger.LogInformation("Attempting to verify email: {Email}", request.Email);

            try
            {
                // Verify OTP
                var session = await _supabaseClient.Auth.VerifyOTP(
                    request.Email,
                    request.Token,
                    Supabase.Gotrue.Constants.EmailOtpType.Signup);

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

        public async Task ResendVerificationEmailAsync(ResendVerificationRequestDto request)
        {
            _logger.LogInformation("Resending verification email to: {Email}", request.Email);

            try
            {
                // Resend signup confirmation email
                await _supabaseClient.Auth.ResetPasswordForEmail(request.Email);

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

        public async Task LogoutAsync()
        {
            _logger.LogInformation("Attempting to logout user");

            try
            {
                await _supabaseClient.Auth.SignOut();

                _logger.LogInformation("User logged out successfully");
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

