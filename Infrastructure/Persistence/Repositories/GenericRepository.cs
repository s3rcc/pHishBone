using Domain.Common;
using Infrastructure.Common.Filters;
using Infrastructure.Common.Interfaces;
using Infrastructure.Paginate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using Microsoft.Extensions.Logging;
using System.Diagnostics;
using System.Linq.Expressions;
using System.Reflection;

namespace Infrastructure.Persistence.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<T> _dbSet;
        private readonly ILogger _logger;
        private readonly string _entityName;

        public GenericRepository(ApplicationDbContext context, ILoggerFactory loggerFactory)
        {
            _context = context;
            _dbSet = context.Set<T>();
            _logger = loggerFactory.CreateLogger($"{nameof(GenericRepository<T>)}<{typeof(T).Name}>");
            _entityName = typeof(T).Name;
        }

        public IQueryable<T> GetQueryable(bool tracking = false)
        {
            return ApplyTracking(_dbSet, tracking);
        }

        public IQueryable<T> FromSqlInterpolated(FormattableString sql, bool tracking = false)
        {
            var query = _dbSet.FromSqlInterpolated(sql);
            return ApplyTracking(query, tracking);
        }

        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }

        public void DeleteRange(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
        }

        public async Task<ICollection<T>> GetListAsync(Expression<Func<T, bool>>? predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, bool tracking = false, CancellationToken cancellationToken = default)
        {
            IQueryable<T> query = _dbSet;

            if (include != null) query = include(query);

            if (predicate != null) query = query.Where(predicate);

            if (orderBy != null) query = orderBy(query);

            query = ApplyTracking(query, tracking);

            return await ExecuteWithLoggingAsync(
                "GetList",
                async () => await query.ToListAsync(cancellationToken),
                (results, elapsedMs) =>
                    _logger.LogInformation(
                        "Successfully retrieved {Count} {EntityName} record(s) from DB in {ElapsedMs:0.000} ms",
                        results.Count,
                        _entityName,
                        elapsedMs));
        }

        public async Task<IPaginate<T>> GetPagingListAsync(IFilter<T>? filter = null, Expression<Func<T, bool>>? predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, int page = 1, int size = 10, string? sortBy = null, bool isAsc = true, CancellationToken cancellationToken = default)
        {
            IQueryable<T> query = _dbSet;

            if (filter != null)
            {
                var filterExpression = filter.ToExpression();
                query = query.Where(filterExpression);
            }
            if (predicate != null) query = query.Where(predicate);
            if (include != null) query = include(query);
            if (!string.IsNullOrEmpty(sortBy))
            {
                query = ApplySort(query, sortBy, isAsc);
            }
            else if (orderBy != null)
            {
                query = orderBy(query);
            }

            query = query.AsNoTracking();

            return await ExecuteWithLoggingAsync(
                "GetPagingList",
                async () => await query.ToPaginateAsync(page, size, 1, cancellationToken),
                (result, elapsedMs) =>
                    _logger.LogInformation(
                        "Successfully retrieved page {Page} of {EntityName} from DB in {ElapsedMs:0.000} ms. Returned {Count} record(s) out of {Total}",
                        result.Page,
                        _entityName,
                        elapsedMs,
                        result.Items.Count,
                        result.Total));
        }

        public async Task InsertAsync(T entity, CancellationToken cancellationToken = default)
        {
            if (entity == null) return;
            await _dbSet.AddAsync(entity, cancellationToken);
        }

        public async Task InsertRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default)
        {
            await _dbSet.AddRangeAsync(entities, cancellationToken);
        }

        public async Task<T?> SingleOrDefaultAsync(Expression<Func<T, bool>>? predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, bool tracking = false, CancellationToken cancellationToken = default)
        {
            IQueryable<T> query = _dbSet;
            if (include != null) query = include(query);

            if (predicate != null) query = query.Where(predicate);

            if (orderBy != null) query = orderBy(query);

            query = ApplyTracking(query, tracking);

            return await ExecuteWithLoggingAsync(
                "SingleOrDefault",
                async () => await query.FirstOrDefaultAsync(cancellationToken),
                (entity, elapsedMs) =>
                    _logger.LogInformation(
                        "Successfully retrieved {EntityName} from DB in {ElapsedMs:0.000} ms. Found: {Found}",
                        _entityName,
                        elapsedMs,
                        entity is not null));
        }

        public Task Update(T entity)
        {
            if (entity == null) return Task.CompletedTask;

            // Check if entity is already being tracked to avoid duplicate tracking conflicts
            var existingEntry = _context.Entry(entity);
            if (existingEntry.State == EntityState.Detached)
            {
                // Only attach and mark as Modified if not already tracked
                _context.Entry(entity).State = EntityState.Modified;
            }
            else if (existingEntry.State == EntityState.Unchanged)
            {
                // Mark as Modified if it's unchanged
                existingEntry.State = EntityState.Modified;
            }
            // If already Modified or Added, no action needed

            return Task.CompletedTask;
        }

        public void UpdateRange(IEnumerable<T> entities)
        {
            _dbSet.UpdateRange(entities);
        }

        private IQueryable<T> ApplyTracking(IQueryable<T> query, bool tracking)
        {
            return tracking ? query : query.AsNoTracking();
        }

        private async Task<TResult> ExecuteWithLoggingAsync<TResult>(
            string operation,
            Func<Task<TResult>> action,
            Action<TResult, double> onSuccess)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                var result = await action();
                stopwatch.Stop();

                onSuccess(result, stopwatch.Elapsed.TotalMilliseconds);
                return result;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "DB {Operation} for {EntityName} failed after {ElapsedMs:0.000} ms",
                    operation,
                    _entityName,
                    stopwatch.Elapsed.TotalMilliseconds);
                throw;
            }
        }

        //sort for paginate
        private IQueryable<T> ApplySort(IQueryable<T> query, string sortBy, bool isAsc)
        {
            var parameter = Expression.Parameter(typeof(T), "x");
            var property = typeof(T).GetProperty(sortBy, BindingFlags.IgnoreCase | BindingFlags.Public | BindingFlags.Instance);
            if (property == null)
            {
                throw new ArgumentException($"Property '{sortBy}' not found on type {typeof(T).Name}");
            }
            var propertyAccess = Expression.Property(parameter, property);
            var lambda = Expression.Lambda(propertyAccess, parameter);

            string methodName = isAsc ? "OrderBy" : "OrderByDescending";

            var resultExpression = Expression.Call(typeof(Queryable), methodName,
                new Type[] { typeof(T), propertyAccess.Type },
                query.Expression, Expression.Quote(lambda));
            return query.Provider.CreateQuery<T>(resultExpression);
        }
    }
}
