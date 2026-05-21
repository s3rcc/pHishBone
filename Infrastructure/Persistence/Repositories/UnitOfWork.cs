using Domain.Common;
using Infrastructure.Common.Interfaces;
using Microsoft.EntityFrameworkCore.Storage;
using Microsoft.Extensions.Logging;
using System.Diagnostics;

namespace Infrastructure.Persistence.Repositories
{
    public class UnitOfWork : IUnitOfWork
    {
        private readonly ApplicationDbContext _context;
        private readonly Dictionary<Type, object> _repositories;
        private readonly ILogger<UnitOfWork> _logger;
        private readonly ILoggerFactory _loggerFactory;
        private IDbContextTransaction? _transaction;

        public UnitOfWork(ApplicationDbContext context, ILogger<UnitOfWork> logger, ILoggerFactory loggerFactory)
        {
            _context = context;
            _repositories = new Dictionary<Type, object>();
            _logger = logger;
            _loggerFactory = loggerFactory;
        }

        public IGenericRepository<T> Repository<T>() where T : BaseEntity
        {
            var type = typeof(T);

            if (!_repositories.ContainsKey(type))
            {
                var repositoryInstance = new GenericRepository<T>(_context, _loggerFactory);
                _repositories.Add(type, repositoryInstance);
            }

            return (IGenericRepository<T>)_repositories[type];
        }

        public async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                var affectedRows = await _context.SaveChangesAsync(cancellationToken);
                stopwatch.Stop();

                _logger.LogInformation(
                    "DB SaveChanges completed successfully in {ElapsedMs:0.000} ms. Affected row count: {AffectedRows}",
                    stopwatch.Elapsed.TotalMilliseconds,
                    affectedRows);

                return affectedRows;
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "DB SaveChanges failed after {ElapsedMs:0.000} ms",
                    stopwatch.Elapsed.TotalMilliseconds);
                throw;
            }
        }

        public async Task BeginTransactionAsync(CancellationToken cancellationToken = default)
        {
            var stopwatch = Stopwatch.StartNew();

            try
            {
                _transaction = await _context.Database.BeginTransactionAsync(cancellationToken);
                stopwatch.Stop();

                _logger.LogInformation(
                    "DB transaction {TransactionId} started in {ElapsedMs:0.000} ms",
                    _transaction.TransactionId,
                    stopwatch.Elapsed.TotalMilliseconds);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "DB transaction start failed after {ElapsedMs:0.000} ms",
                    stopwatch.Elapsed.TotalMilliseconds);
                throw;
            }
        }

        public async Task CommitTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction == null)
            {
                _logger.LogWarning("CommitTransactionAsync was called without an active DB transaction");
                return;
            }

            var transactionId = _transaction.TransactionId;
            var stopwatch = Stopwatch.StartNew();

            try
            {
                await _transaction.CommitAsync(cancellationToken);
                stopwatch.Stop();

                _logger.LogInformation(
                    "DB transaction {TransactionId} committed successfully in {ElapsedMs:0.000} ms",
                    transactionId,
                    stopwatch.Elapsed.TotalMilliseconds);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "DB transaction {TransactionId} commit failed after {ElapsedMs:0.000} ms",
                    transactionId,
                    stopwatch.Elapsed.TotalMilliseconds);
                throw;
            }
            finally
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public async Task RollbackTransactionAsync(CancellationToken cancellationToken = default)
        {
            if (_transaction == null)
            {
                _logger.LogWarning("RollbackTransactionAsync was called without an active DB transaction");
                return;
            }

            var transactionId = _transaction.TransactionId;
            var stopwatch = Stopwatch.StartNew();

            try
            {
                await _transaction.RollbackAsync(cancellationToken);
                stopwatch.Stop();

                _logger.LogInformation(
                    "DB transaction {TransactionId} rolled back in {ElapsedMs:0.000} ms",
                    transactionId,
                    stopwatch.Elapsed.TotalMilliseconds);
            }
            catch (Exception ex)
            {
                stopwatch.Stop();
                _logger.LogError(
                    ex,
                    "DB transaction {TransactionId} rollback failed after {ElapsedMs:0.000} ms",
                    transactionId,
                    stopwatch.Elapsed.TotalMilliseconds);
                throw;
            }
            finally
            {
                await _transaction.DisposeAsync();
                _transaction = null;
            }
        }

        public void Dispose()
        {
            _transaction?.Dispose();
            _context.Dispose();
        }
    }
}
