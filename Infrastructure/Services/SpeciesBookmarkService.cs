using Application.Common;
using Application.Common.Interfaces;
using Application.Constants;
using Application.DTOs.PBUserDTOs;
using Domain.Entities;
using Domain.Entities.Catalog;
using Domain.Exceptions;
using Infrastructure.Common.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;

namespace Infrastructure.Services
{
    /// <summary>
    /// Handles bookmark/favorite management for the authenticated user's species collection.
    /// </summary>
    public class SpeciesBookmarkService : ISpeciesBookmarkService
    {
        private const int DefaultPageSize = 12;
        private const int MaxPageSize = 50;

        private readonly IUnitOfWork _unitOfWork;
        private readonly ICacheService _cache;
        private readonly ILogger<SpeciesBookmarkService> _logger;

        public SpeciesBookmarkService(
            IUnitOfWork unitOfWork,
            ICacheService cache,
            ILogger<SpeciesBookmarkService> logger)
        {
            _unitOfWork = unitOfWork;
            _cache = cache;
            _logger = logger;
        }

        public async Task<BookmarkedSpeciesDto> AddAsync(string userSupabaseId, string speciesId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Adding species bookmark. UserSupabaseId: {UserSupabaseId}, SpeciesId: {SpeciesId}", userSupabaseId, speciesId);

            var user = await GetUserAsync(userSupabaseId, cancellationToken);
            var species = await GetActiveSpeciesAsync(speciesId, cancellationToken);

            var existingBookmark = await _unitOfWork.Repository<SpeciesBookmark>().SingleOrDefaultAsync(
                predicate: bookmark => bookmark.UserId == user.Id && bookmark.SpeciesId == speciesId,
                cancellationToken: cancellationToken);

            if (existingBookmark != null && existingBookmark.DeletedTime == null)
            {
                _logger.LogInformation("Species bookmark already exists. UserId: {UserId}, SpeciesId: {SpeciesId}", user.Id, speciesId);
                return BuildBookmarkedSpeciesDto(species, existingBookmark.CreatedTime);
            }

            if (existingBookmark != null)
            {
                existingBookmark.DeletedTime = null;
                existingBookmark.DeletedBy = null;
                existingBookmark.LastUpdatedBy = userSupabaseId;
                existingBookmark.LastUpdatedTime = DateTime.UtcNow;
                await _unitOfWork.Repository<SpeciesBookmark>().Update(existingBookmark);
                await _unitOfWork.SaveChangesAsync(cancellationToken);

                await InvalidateBookmarkCachesAsync(userSupabaseId, cancellationToken);

                _logger.LogInformation("Restored species bookmark. UserId: {UserId}, SpeciesId: {SpeciesId}", user.Id, speciesId);
                return BuildBookmarkedSpeciesDto(species, existingBookmark.CreatedTime);
            }

            var bookmark = new SpeciesBookmark
            {
                UserId = user.Id,
                SpeciesId = species.Id,
                CreatedBy = userSupabaseId
            };

            await _unitOfWork.Repository<SpeciesBookmark>().InsertAsync(bookmark, cancellationToken);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await InvalidateBookmarkCachesAsync(userSupabaseId, cancellationToken);

            _logger.LogInformation("Species bookmark created. UserId: {UserId}, SpeciesId: {SpeciesId}", user.Id, speciesId);
            return BuildBookmarkedSpeciesDto(species, bookmark.CreatedTime);
        }

        public async Task RemoveAsync(string userSupabaseId, string speciesId, CancellationToken cancellationToken = default)
        {
            _logger.LogInformation("Removing species bookmark. UserSupabaseId: {UserSupabaseId}, SpeciesId: {SpeciesId}", userSupabaseId, speciesId);

            var user = await GetUserAsync(userSupabaseId, cancellationToken);
            var existingBookmark = await _unitOfWork.Repository<SpeciesBookmark>().SingleOrDefaultAsync(
                predicate: bookmark =>
                    bookmark.UserId == user.Id &&
                    bookmark.SpeciesId == speciesId &&
                    bookmark.DeletedTime == null,
                cancellationToken: cancellationToken);

            if (existingBookmark == null)
            {
                _logger.LogInformation("Species bookmark removal skipped because bookmark does not exist. UserId: {UserId}, SpeciesId: {SpeciesId}", user.Id, speciesId);
                return;
            }

            existingBookmark.DeletedTime = DateTime.UtcNow;
            existingBookmark.DeletedBy = userSupabaseId;
            existingBookmark.LastUpdatedBy = userSupabaseId;
            existingBookmark.LastUpdatedTime = DateTime.UtcNow;

            await _unitOfWork.Repository<SpeciesBookmark>().Update(existingBookmark);
            await _unitOfWork.SaveChangesAsync(cancellationToken);
            await InvalidateBookmarkCachesAsync(userSupabaseId, cancellationToken);

            _logger.LogInformation("Species bookmark removed. UserId: {UserId}, SpeciesId: {SpeciesId}", user.Id, speciesId);
        }

        public async Task<PaginationResponse<BookmarkedSpeciesDto>> GetPaginatedAsync(string userSupabaseId, SpeciesBookmarkFilterDto filter, CancellationToken cancellationToken = default)
        {
            var page = filter.Page <= 0 ? 1 : filter.Page;
            var size = filter.Size <= 0 ? DefaultPageSize : Math.Min(filter.Size, MaxPageSize);
            var searchTerm = filter.SearchTerm?.Trim();
            var normalizedSearchTerm = searchTerm?.ToLowerInvariant();
            var sortBy = string.IsNullOrWhiteSpace(filter.SortBy) ? nameof(BookmarkedSpeciesDto.BookmarkedTime) : filter.SortBy.Trim();
            var cachePrefix = BuildBookmarkCachePrefix(userSupabaseId);
            var cacheKey = $"{cachePrefix}{CacheKeyConstant.SpeciesBookmarksList}{page}:{size}:{normalizedSearchTerm}:{sortBy}:{filter.IsAscending}";

            var cached = await _cache.GetAsync<PaginationResponse<BookmarkedSpeciesDto>>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Species bookmarks served from cache. UserSupabaseId: {UserSupabaseId}", userSupabaseId);
                return cached;
            }

            var user = await GetUserAsync(userSupabaseId, cancellationToken);
            _logger.LogInformation("Retrieving paginated species bookmarks. UserId: {UserId}, Page: {Page}, Size: {Size}", user.Id, page, size);

            var paging = await _unitOfWork.Repository<SpeciesBookmark>().GetPagingListAsync(
                predicate: bookmark =>
                    bookmark.UserId == user.Id &&
                    bookmark.DeletedTime == null &&
                    bookmark.Species.DeletedTime == null &&
                    bookmark.Species.IsActive == true &&
                    (string.IsNullOrWhiteSpace(normalizedSearchTerm) ||
                     bookmark.Species.CommonName.ToLower().Contains(normalizedSearchTerm) ||
                     (bookmark.Species.ScientificName != null && bookmark.Species.ScientificName.ToLower().Contains(normalizedSearchTerm))),
                include: query => query
                    .Include(bookmark => bookmark.Species)
                    .ThenInclude(species => species.Type),
                orderBy: query => ApplyBookmarkSort(query, sortBy, filter.IsAscending),
                page: page,
                size: size,
                cancellationToken: cancellationToken);

            var response = new PaginationResponse<BookmarkedSpeciesDto>
            {
                Page = paging.Page,
                Size = paging.Size,
                Total = paging.Total,
                TotalPages = paging.TotalPages,
                Items = paging.Items.Select(bookmark => BuildBookmarkedSpeciesDto(bookmark.Species, bookmark.CreatedTime)).ToList()
            };

            await _cache.SetAsync(
                cacheKey,
                response,
                TimeSpan.FromMinutes(CacheKeyConstant.ListExpiryMinutes),
                cancellationToken);

            return response;
        }

        public async Task<SpeciesBookmarkStatusDto> GetStatusAsync(string userSupabaseId, string speciesId, CancellationToken cancellationToken = default)
        {
            var cacheKey = $"{BuildBookmarkCachePrefix(userSupabaseId)}{CacheKeyConstant.SpeciesBookmarkStatus}{speciesId}";
            var cached = await _cache.GetAsync<SpeciesBookmarkStatusDto>(cacheKey, cancellationToken);
            if (cached != null)
            {
                _logger.LogInformation("Species bookmark status served from cache. UserSupabaseId: {UserSupabaseId}, SpeciesId: {SpeciesId}", userSupabaseId, speciesId);
                return cached;
            }

            var user = await GetUserAsync(userSupabaseId, cancellationToken);
            var bookmark = await _unitOfWork.Repository<SpeciesBookmark>().SingleOrDefaultAsync(
                predicate: existingBookmark =>
                    existingBookmark.UserId == user.Id &&
                    existingBookmark.SpeciesId == speciesId &&
                    existingBookmark.DeletedTime == null &&
                    existingBookmark.Species.DeletedTime == null &&
                    existingBookmark.Species.IsActive == true,
                tracking: false,
                cancellationToken: cancellationToken);

            var status = new SpeciesBookmarkStatusDto
            {
                SpeciesId = speciesId,
                IsBookmarked = bookmark != null,
                BookmarkedTime = bookmark?.CreatedTime
            };

            await _cache.SetAsync(
                cacheKey,
                status,
                TimeSpan.FromMinutes(CacheKeyConstant.DefaultExpiryMinutes),
                cancellationToken);

            return status;
        }

        private async Task<PBUser> GetUserAsync(string userSupabaseId, CancellationToken cancellationToken)
        {
            var user = await _unitOfWork.Repository<PBUser>().SingleOrDefaultAsync(
                predicate: existingUser =>
                    existingUser.SupabaseUserId == userSupabaseId &&
                    existingUser.DeletedTime == null,
                tracking: false,
                cancellationToken: cancellationToken);

            if (user == null)
            {
                _logger.LogWarning("Bookmark operation rejected because the current user was not found. UserSupabaseId: {UserSupabaseId}", userSupabaseId);
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    ErrorMessageConstant.UserNotFound);
            }

            return user;
        }

        private async Task<Species> GetActiveSpeciesAsync(string speciesId, CancellationToken cancellationToken)
        {
            var species = await _unitOfWork.Repository<Species>().SingleOrDefaultAsync(
                predicate: existingSpecies =>
                    existingSpecies.Id == speciesId &&
                    existingSpecies.DeletedTime == null &&
                    existingSpecies.IsActive == true,
                include: query => query.Include(existingSpecies => existingSpecies.Type),
                tracking: false,
                cancellationToken: cancellationToken);

            if (species == null)
            {
                _logger.LogWarning("Bookmark operation rejected because species was not found or inactive. SpeciesId: {SpeciesId}", speciesId);
                throw new CustomErrorException(
                    StatusCodes.Status404NotFound,
                    ErrorCode.NOT_FOUND,
                    CatalogErrorMessageConstant.SpeciesNotFound);
            }

            return species;
        }

        private static IOrderedQueryable<SpeciesBookmark> ApplyBookmarkSort(
            IQueryable<SpeciesBookmark> query,
            string sortBy,
            bool isAscending)
        {
            return sortBy.ToLowerInvariant() switch
            {
                "commonname" => isAscending
                    ? query.OrderBy(bookmark => bookmark.Species.CommonName)
                    : query.OrderByDescending(bookmark => bookmark.Species.CommonName),
                "scientificname" => isAscending
                    ? query.OrderBy(bookmark => bookmark.Species.ScientificName)
                    : query.OrderByDescending(bookmark => bookmark.Species.ScientificName),
                "bookmarkedtime" => isAscending
                    ? query.OrderBy(bookmark => bookmark.CreatedTime)
                    : query.OrderByDescending(bookmark => bookmark.CreatedTime),
                "createdtime" => isAscending
                    ? query.OrderBy(bookmark => bookmark.CreatedTime)
                    : query.OrderByDescending(bookmark => bookmark.CreatedTime),
                _ => query.OrderByDescending(bookmark => bookmark.CreatedTime)
            };
        }

        private async Task InvalidateBookmarkCachesAsync(string userSupabaseId, CancellationToken cancellationToken)
        {
            await _cache.RemoveByPrefixAsync(BuildBookmarkCachePrefix(userSupabaseId), cancellationToken);
        }

        private static string BuildBookmarkCachePrefix(string userSupabaseId)
        {
            return $"{CacheKeyConstant.SpeciesBookmarksPrefix}{userSupabaseId}:";
        }

        private static BookmarkedSpeciesDto BuildBookmarkedSpeciesDto(Species species, DateTime bookmarkedTime)
        {
            return new BookmarkedSpeciesDto
            {
                Id = species.Id,
                TypeId = species.TypeId,
                TypeName = species.Type?.Name,
                ScientificName = species.ScientificName,
                CommonName = species.CommonName,
                ThumbnailUrl = species.ThumbnailUrl,
                Slug = species.Slug,
                IsActive = species.IsActive,
                CreatedTime = species.CreatedTime,
                BookmarkedTime = bookmarkedTime
            };
        }
    }
}
