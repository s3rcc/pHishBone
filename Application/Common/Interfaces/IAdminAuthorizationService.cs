namespace Application.Common.Interfaces
{
    public interface IAdminAuthorizationService
    {
        Task EnsureCurrentUserIsAdminAsync(CancellationToken cancellationToken = default);
    }
}
