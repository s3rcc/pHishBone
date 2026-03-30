using Application.DTOs.Auth;

namespace Application.Common.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request, CancellationToken cancellationToken = default);
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request, CancellationToken cancellationToken = default);
        Task<LoginResponseDto> RefreshTokenAsync(string refreshToken, CancellationToken cancellationToken = default);
        Task<UserDto> GetCurrentUserAsync(string userId, CancellationToken cancellationToken = default);
        Task ForgotPasswordAsync(ForgotPasswordRequestDto request, CancellationToken cancellationToken = default);
        Task ResetPasswordAsync(ResetPasswordRequestDto request, CancellationToken cancellationToken = default);
        Task ChangePasswordAsync(ChangePasswordRequestDto request, string userId, CancellationToken cancellationToken = default);
        Task VerifyEmailAsync(VerifyEmailRequestDto request, CancellationToken cancellationToken = default);
        Task ResendVerificationEmailAsync(ResendVerificationRequestDto request, CancellationToken cancellationToken = default);
        Task LogoutAsync(string accessToken, CancellationToken cancellationToken = default);
    }
}
