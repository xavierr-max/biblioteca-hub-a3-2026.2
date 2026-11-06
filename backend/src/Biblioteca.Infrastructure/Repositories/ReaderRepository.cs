using Biblioteca.Application.Interfaces;
using Biblioteca.Domain.Entities;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace Biblioteca.Infrastructure.Repositories;

public sealed class ReaderRepository(BibliotecaDbContext dbContext) : IReaderRepository
{
    public IQueryable<Reader> Query() => dbContext.Readers;

    public Task<Reader?> FindAsync(Guid id, CancellationToken cancellationToken = default) =>
        dbContext.Readers.FirstOrDefaultAsync(reader => reader.Id == id, cancellationToken);

    public async Task SaveAsync(Reader reader, CancellationToken cancellationToken = default)
    {
        if (dbContext.Entry(reader).State == EntityState.Detached) dbContext.Readers.Add(reader);
        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
