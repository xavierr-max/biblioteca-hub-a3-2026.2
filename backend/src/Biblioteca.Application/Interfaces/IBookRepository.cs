using Biblioteca.Domain.Entities;

namespace Biblioteca.Application.Interfaces;

public interface IBookRepository
{
    IQueryable<Book> Query();
    Task<Book?> FindAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveAsync(Book book, CancellationToken cancellationToken = default);
}
