using Application.DTOs.Auth;

namespace Application.Common.Interfaces
{
    public interface IAuthService
    {
        Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request);
        Task<LoginResponseDto> LoginAsync(LoginRequestDto request);
        Task<LoginResponseDto> RefreshTokenAsync(string refreshToken);
        Task<UserDto> GetCurrentUserAsync(string userId);
        Task ForgotPasswordAsync(ForgotPasswordRequestDto request);
        Task ResetPasswordAsync(ResetPasswordRequestDto request);
        Task ChangePasswordAsync(ChangePasswordRequestDto request, string userId);
        Task VerifyEmailAsync(VerifyEmailRequestDto request);
        Task ResendVerificationEmailAsync(ResendVerificationRequestDto request);
        Task LogoutAsync(string accessToken);
    }
}
