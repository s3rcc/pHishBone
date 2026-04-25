using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.Auth;
using Application.DTOs.PBUserDTOs;
using Application.Services;
using AutoMapper;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Handles user profile management: update profile, upload avatar, change email.
    /// </summary>
    public class UserService : IUserService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly IMapper _mapper;
        private readonly IPhotoService _photoService;
        private readonly Supabase.Client _supabaseClient;
        private readonly ILogger<UserService> _logger;

        public UserService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            IPhotoService photoService,
            Supabase.Client supabaseClient,
            ILogger<UserService> logger)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _photoService = photoService;
            _supabaseClient = supabaseClient;
            _logger = logger;
        }

        public async Task<ICollection<UserDto>> GetUsersAsync(CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Retrieving active users for role management");

            var users = await _unitOfWork.Repository<PBUser>()
                .GetListAsync(
                    predicate: u => u.DeletedTime == null,
                    orderBy: query => query.OrderBy(u => u.Username),
                    tracking: false,
                    cancellationToken: cancellationToken);

            return _mapper.Map<ICollection<UserDto>>(users);
        }

        /// <summary>
        /// Updates the user's profile (currently username).
        /// userId here is the Supabase UID extracted from the JWT.
        /// </summary>
        public async Task<UserDto> UpdateProfileAsync(UpdateProfileRequestDto dto, string userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Updating profile for user: {UserId}", userId);

            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.SupabaseUserId == userId, cancellationToken: cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found for SupabaseUserId: {UserId}", userId);
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ErrorMessageConstant.UserNotFound);
            }

            if (dto.Username != null)
            {
                // Check for username conflict
                var usernameExists = await _unitOfWork.Repository<PBUser>()
                    .SingleOrDefaultAsync(
                        predicate: u => u.Username == dto.Username && u.SupabaseUserId != userId && u.DeletedTime == null,
                        tracking: false,
                        cancellationToken: cancellationToken);

                if (usernameExists != null)
                {
                    _logger.LogWarning("Username '{Username}' is already taken", dto.Username);
                    throw new CustomErrorException(
                        StatusCodes.Status400BadRequest,
                        ErrorCode.DUPLICATE,
                        ErrorMessageConstant.UsernameTaken);
                }

                user.Username = dto.Username;
            }

            // GenericRepository.SingleOrDefaultAsync always uses AsNoTracking(), so we must
            // explicitly call Update() to mark the entity as Modified before saving.
            await _unitOfWork.Repository<PBUser>().Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Profile updated successfully for user: {UserId}", userId);
            return _mapper.Map<UserDto>(user);
        }

        /// <summary>
        /// Uploads a new avatar for the user, replacing the old one on Cloudinary if it exists.
        /// </summary>
        public async Task<UserDto> UploadAvatarAsync(IFormFile file, string userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Uploading avatar for user: {UserId}", userId);

            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.SupabaseUserId == userId, cancellationToken: cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found for SupabaseUserId: {UserId}", userId);
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ErrorMessageConstant.UserNotFound);
            }

            // Delete old avatar from Cloudinary if one exists
            if (!string.IsNullOrWhiteSpace(user.AvatarPublicId))
            {
                _logger.LogInformation("Deleting old avatar from Cloudinary: {PublicId}", user.AvatarPublicId);
                await _photoService.DeletePhotoAsync(user.AvatarPublicId, cancellationToken);
            }

            // Upload new avatar
            var uploadResult = await _photoService.AddPhotoAsync(file, "avatars", cancellationToken);

            if (!uploadResult.IsSuccess)
            {
                _logger.LogError("Avatar upload failed for user {UserId}: {Error}", userId, uploadResult.Error);
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    ErrorMessageConstant.AvatarUploadFailed);
            }

            user.AvatarUrl = uploadResult.Url;
            user.AvatarPublicId = uploadResult.PublicId;

            // GenericRepository.SingleOrDefaultAsync always uses AsNoTracking(), so we must
            // explicitly call Update() to mark the entity as Modified before saving.
            await _unitOfWork.Repository<PBUser>().Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Avatar uploaded successfully for user: {UserId}, PublicId: {PublicId}",
                userId, uploadResult.PublicId);

            return _mapper.Map<UserDto>(user);
        }

        /// <summary>
        /// Requests an email change via Supabase Auth.
        /// Supabase sends a confirmation to both old and new addresses.
        /// The local DB is updated immediately (MVP strategy).
        /// </summary>
        public async Task<string> ChangeEmailAsync(ChangeEmailRequestDto dto, string userId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Requesting email change for user: {UserId} to: {NewEmail}", userId, dto.NewEmail);

            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.SupabaseUserId == userId, cancellationToken: cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found for SupabaseUserId: {UserId}", userId);
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ErrorMessageConstant.UserNotFound);
            }

            // Check if new email is already in use locally
            var emailExists = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(
                    predicate: u => u.Email == dto.NewEmail && u.SupabaseUserId != userId && u.DeletedTime == null,
                    tracking: false,
                    cancellationToken: cancellationToken);

            if (emailExists != null)
            {
                _logger.LogWarning("Email '{NewEmail}' is already in use", dto.NewEmail);
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.DUPLICATE,
                    ErrorMessageConstant.DuplicateEmail);
            }

            try
            {
                // Request email change via Supabase Auth — triggers confirmation emails to both addresses
                var userAttributes = new Supabase.Gotrue.UserAttributes
                {
                    Email = dto.NewEmail
                };

                await _supabaseClient.Auth.Update(userAttributes).WaitAsync(cancellationToken);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Supabase email change failed for user: {UserId}", userId);
                throw new CustomErrorException(
                    StatusCodes.Status500InternalServerError,
                    ErrorCode.INTERNAL_SERVER_ERROR,
                    ErrorMessageConstant.EmailChangeFailed);
            }

            // Update local DB immediately (MVP sync strategy).
            // GenericRepository.SingleOrDefaultAsync always uses AsNoTracking(), so Update() is required.
            user.Email = dto.NewEmail;
            await _unitOfWork.Repository<PBUser>().Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Email change requested successfully for user: {UserId}", userId);
            return SuccessMessageConstant.EmailChangeRequested;
        }

        public async Task<UserDto> UpdateUserRoleAsync(string id, UpdateUserRoleRequestDto dto, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Updating role for user {UserId} to {Role}", id, dto.Role);

            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(
                    predicate: u => u.Id == id,
                    cancellationToken: cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("User not found when updating role. UserId: {UserId}", id);
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ErrorMessageConstant.UserNotFound);
            }

            if (user.DeletedTime != null)
            {
                _logger.LogWarning("Deleted user role update rejected. UserId: {UserId}", id);
                throw new CustomErrorException(
                    StatusCodes.Status400BadRequest,
                    ErrorCode.BADREQUEST,
                    ErrorMessageConstant.CannotAssignDeletedUserRole);
            }

            user.Role = dto.Role;

            await _unitOfWork.Repository<PBUser>().Update(user);
            await _unitOfWork.SaveChangesAsync(cancellationToken);

            _logger.LogInformation("Updated role for user {UserId} to {Role}", id, dto.Role);
            return _mapper.Map<UserDto>(user);
        }
    }
}
