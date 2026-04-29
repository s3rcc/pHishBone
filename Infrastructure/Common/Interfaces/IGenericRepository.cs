using Domain.Common;
using Infrastructure.Common.Filters;
using Infrastructure.Paginate;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;

namespace Infrastructure.Common.Interfaces
{
    public interface IGenericRepository<T> where T : BaseEntity
    {
        IQueryable<T> GetQueryable(bool tracking = false);
        IQueryable<T> FromSqlInterpolated(FormattableString sql, bool tracking = false);

        // Reads
        Task<T?> SingleOrDefaultAsync(
        Expression<Func<T, bool>>? predicate = null,
        Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
        Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null,
        bool tracking = false,
        CancellationToken cancellationToken = default);

        Task<ICollection<T>> GetListAsync(
            Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null,
            bool tracking = false,
            CancellationToken cancellationToken = default);

        Task<IPaginate<T>> GetPagingListAsync(
            IFilter<T>? filter = null,
            Expression<Func<T, bool>>? predicate = null,
            Func<IQueryable<T>, IOrderedQueryable<T>>? orderBy = null,
            Func<IQueryable<T>, IIncludableQueryable<T, object>>? include = null,
            int page = 1,
            int size = 10,
            string? sortBy = null,
            bool isAsc = true,
            CancellationToken cancellationToken = default);

        // --- Writes ---
        Task InsertAsync(T entity, CancellationToken cancellationToken = default);
        Task InsertRangeAsync(IEnumerable<T> entities, CancellationToken cancellationToken = default);
        Task Update(T entity);
        void UpdateRange(IEnumerable<T> entities);
        void Delete(T entity);
        void DeleteRange(IEnumerable<T> entities);
    }
}
