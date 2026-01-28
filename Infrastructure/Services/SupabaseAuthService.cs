using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.Auth;
using AutoMapper;
using Domain.Entities;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
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

        public SupabaseAuthService(
            IUnitOfWork unitOfWork,
            IMapper mapper,
            Supabase.Client supabaseClient)
        {
            _unitOfWork = unitOfWork;
            _mapper = mapper;
            _supabaseClient = supabaseClient;
        }

        public async Task<LoginResponseDto> RegisterAsync(RegisterRequestDto request)
        {
            // Register user in Supabase Auth
            var authResponse = await _supabaseClient.Auth.SignUp(request.Email, request.Password);

            if (authResponse?.User == null)
            {
                
                throw new Exception();
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
            // Authenticate with Supabase
            var authResponse = await _supabaseClient.Auth.SignIn(request.Email, request.Password);

            if (authResponse?.User == null)
            {
                throw new CustomErrorException(StatusCodes.Status401Unauthorized, ErrorCode.UNAUTHORIZED, ErrorMessageConstant.InvalidCredentials);
            }

            // Get user from local database
            var user = await _unitOfWork.Repository<PBUser>()
                .SingleOrDefaultAsync(predicate: u => u.SupabaseUserId == authResponse.User.Id) ?? throw new CustomErrorException(StatusCodes.Status404NotFound, ErrorCode.NOT_FOUND, ErrorMessageConstant.UserNotFound);

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
