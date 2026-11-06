using Biblioteca.Domain.Entities;

namespace Biblioteca.Application.Interfaces;

public interface IReaderRepository
{
    IQueryable<Reader> Query();
    Task<Reader?> FindAsync(Guid id, CancellationToken cancellationToken = default);
    Task SaveAsync(Reader reader, CancellationToken cancellationToken = default);
}
