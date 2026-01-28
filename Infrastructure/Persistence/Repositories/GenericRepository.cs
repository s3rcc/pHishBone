using Domain.Common;
using Infrastructure.Common.Filters;
using Infrastructure.Common.Interfaces;
using Infrastructure.Paginate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;
using System.Reflection;

namespace Infrastructure.Persistence.Repositories
{
    public class GenericRepository<T> : IGenericRepository<T> where T : BaseEntity
    {
        private readonly ApplicationDbContext _context;
        private readonly DbSet<T> _dbSet;

        public GenericRepository(ApplicationDbContext context)
        {
            _context = context;
            _dbSet = context.Set<T>();
        }

        public void Delete(T entity)
        {
            _dbSet.Remove(entity);
        }

        public void DeleteRange(IEnumerable<T> entities)
        {
            _dbSet.RemoveRange(entities);
        }

        public async Task<ICollection<T>> GetListAsync(Expression<Func<T, bool>>? predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, bool tracking = false)
        {
            IQueryable<T> query = _dbSet;

            if (include != null) query = include(query);

            if (predicate != null) query = query.Where(predicate);

            if (orderBy != null) return await orderBy(query).AsNoTracking().ToListAsync();

            return await query.AsNoTracking().ToListAsync();
        }

        public async Task<IPaginate<T>> GetPagingListAsync(IFilter<T>? filter = null, Expression<Func<T, bool>>? predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, int page = 1, int size = 10, string? sortBy = null, bool isAsc = true)
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

            return await query.AsNoTracking().ToPaginateAsync(page, size, 1);
        }

        public async Task InsertAsync(T entity)
        {
            if (entity == null) return;
            await _dbSet.AddAsync(entity);
        }

        public async Task InsertRangeAsync(IEnumerable<T> entities)
        {
            await _dbSet.AddRangeAsync(entities);
        }

        public async Task<T?> SingleOrDefaultAsync(Expression<Func<T, bool>>? predicate = null, Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null, Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null, bool tracking = false)
        {
            IQueryable<T> query = _dbSet;
            if (include != null) query = include(query);

            if (predicate != null) query = query.Where(predicate);

            if (orderBy != null) return await orderBy(query).AsNoTracking().FirstOrDefaultAsync();

            return await query.AsNoTracking().FirstOrDefaultAsync();
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
