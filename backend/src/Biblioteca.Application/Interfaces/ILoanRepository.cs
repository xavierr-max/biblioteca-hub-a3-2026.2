using Biblioteca.Domain.Entities;

namespace Biblioteca.Application.Interfaces;

public interface ILoanRepository
{
    IQueryable<Loan> Query();
    Task<Loan?> FindAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Book?> FindBookAsync(Guid id, CancellationToken cancellationToken = default);
    Task<BookCopy?> FindCopyAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Reader?> FindReaderAsync(Guid id, CancellationToken cancellationToken = default);
    void Add(Loan loan);
    Task SaveAsync(CancellationToken cancellationToken = default);
    Task<T> InTransactionAsync<T>(Func<Task<T>> operation, CancellationToken cancellationToken = default);
}
