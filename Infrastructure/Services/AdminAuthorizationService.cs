using Application.Common.Interfaces;
using Application.Constants;
using Domain.Entities;
using Domain.Enums;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    public class AdminAuthorizationService : IAdminAuthorizationService
    {
        private readonly IUnitOfWork _unitOfWork;
        private readonly ICurrentUserService _currentUserService;
        private readonly ILogger<AdminAuthorizationService> _logger;

        public AdminAuthorizationService(
            IUnitOfWork unitOfWork,
            ICurrentUserService currentUserService,
            ILogger<AdminAuthorizationService> logger)
        {
            _unitOfWork = unitOfWork;
            _currentUserService = currentUserService;
            _logger = logger;
        }

        public async Task EnsureCurrentUserIsAdminAsync(CancellationToken cancellationToken = default)
        {
            var currentUserId = _currentUserService.GetUserId();
            if (string.IsNullOrWhiteSpace(currentUserId))
            {
                throw new CustomErrorException(
                    StatusCodes.Status401Unauthorized,
                    ErrorCode.UNAUTHORIZED,
                    ErrorMessageConstant.UserNotFound
                );
            }

            var user = await _unitOfWork.Repository<PBUser>().SingleOrDefaultAsync(
                predicate: x => x.SupabaseUserId == currentUserId && x.Role == Role.Admin
            );

            if (user == null)
            {
                _logger.LogWarning("Admin-only action rejected for user {UserId}", currentUserId);
                throw new CustomErrorException(
                    StatusCodes.Status403Forbidden,
                    ErrorCode.FORBIDDEN,
                    AiErrorMessageConstant.AiUnauthorizedAdminOnly
                );
            }
        }
    }
}
