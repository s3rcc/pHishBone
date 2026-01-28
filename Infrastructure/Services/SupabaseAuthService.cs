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
    }
}

