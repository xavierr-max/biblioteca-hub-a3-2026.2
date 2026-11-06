using Biblioteca.Application.Interfaces;
using Biblioteca.Domain.Entities;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Biblioteca.Infrastructure.Repositories;

public sealed class BookRepository(BibliotecaDbContext dbContext) : IBookRepository
{
    public IQueryable<Book> Query() => dbContext.Books.Include(book => book.Copies);

    public Task<Book?> FindAsync(Guid id, CancellationToken cancellationToken = default) => Query().FirstOrDefaultAsync(book => book.Id == id, cancellationToken);

    public async Task SaveAsync(Book book, CancellationToken cancellationToken = default)
    {
        if (dbContext.Entry(book).State == EntityState.Detached) dbContext.Books.Add(book);

        foreach (var copy in book.Copies)
        {
            var entry = dbContext.Entry(copy);
            if (entry.State == EntityState.Detached)
            {
                dbContext.Copies.Add(copy);
            }
            else if (entry.State == EntityState.Modified)
            {
                entry.State = EntityState.Unchanged;
            }
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
