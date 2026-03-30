using Application.DTOs.Auth;
using Application.DTOs.PBUserDTOs;
using Microsoft.AspNetCore.Http;

namespace Application.Common.Interfaces
{
    /// <summary>
    /// Service interface for user profile management operations.
    /// </summary>
    public interface IUserService
    {
        /// <summary>
        /// Updates the authenticated user's profile (e.g. username).
        /// </summary>
        Task<UserDto> UpdateProfileAsync(UpdateProfileRequestDto dto, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Uploads a new avatar image for the authenticated user.
        /// Replaces any existing avatar on Cloudinary.
        /// </summary>
        Task<UserDto> UploadAvatarAsync(IFormFile file, string userId, CancellationToken cancellationToken = default);

        /// <summary>
        /// Requests an email change via Supabase Auth and updates the local DB.
        /// Supabase sends confirmation emails to both old and new addresses.
        /// </summary>
        Task<string> ChangeEmailAsync(ChangeEmailRequestDto dto, string userId, CancellationToken cancellationToken = default);
    }
}
