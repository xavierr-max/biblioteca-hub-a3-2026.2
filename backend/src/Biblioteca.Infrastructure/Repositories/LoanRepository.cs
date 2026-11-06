using Biblioteca.Application.Interfaces;
using Biblioteca.Domain.Entities;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;

namespace Biblioteca.Infrastructure.Repositories;

public sealed class LoanRepository(BibliotecaDbContext dbContext) : ILoanRepository
{
    public IQueryable<Loan> Query() => dbContext.Loans.AsNoTracking();

    public Task<Loan?> FindAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Loans.FirstOrDefaultAsync(loan => loan.Id == id, cancellationToken);

    public Task<Book?> FindBookAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Books.FirstOrDefaultAsync(book => book.Id == id, cancellationToken);

    public Task<BookCopy?> FindCopyAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Copies.FirstOrDefaultAsync(copy => copy.Id == id, cancellationToken);

    public Task<Reader?> FindReaderAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Readers.FirstOrDefaultAsync(reader => reader.Id == id, cancellationToken);

    public void Add(Loan loan) => dbContext.Loans.Add(loan);

    public Task SaveAsync(CancellationToken cancellationToken = default) => dbContext.SaveChangesAsync(cancellationToken);

    public async Task<T> InTransactionAsync<T>(Func<Task<T>> operation, CancellationToken cancellationToken = default)
    {
        await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
        var result = await operation();
        await transaction.CommitAsync(cancellationToken);
        return result;
    }
}
