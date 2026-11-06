using Biblioteca.Application.DTOs;
using Biblioteca.Application.Interfaces;
using Biblioteca.Domain;
using Biblioteca.Domain.Entities;
using Biblioteca.Domain.Enums;

namespace Biblioteca.Application.Services;

public sealed class ReaderService(IReaderRepository repository)
{
    public Task<IReadOnlyList<ReaderDto>> ListAsync(string? search, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var query = repository.Query();
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(reader => reader.Name.Contains(search) || reader.Identifier.Contains(search));
        }

        return Task.FromResult<IReadOnlyList<ReaderDto>>(query.ToList().Select(Map).ToList());
    }

    public async Task<ReaderDto?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var reader = await repository.FindAsync(id, cancellationToken);
        return reader is null ? null : Map(reader);
    }

    public async Task<ReaderDto> CreateAsync(ReaderInput input, CancellationToken cancellationToken = default)
    {
        var reader = new Reader(input.Name, input.Identifier, input.Email, input.Phone, input.Course, input.Notes);
        await EnsureIdentifierIsUniqueAsync(reader.Identifier, null, cancellationToken);
        await repository.SaveAsync(reader, cancellationToken);
        return Map(reader);
    }

    public async Task<ReaderDto?> UpdateAsync(Guid id, ReaderInput input, CancellationToken cancellationToken = default)
    {
        var reader = await repository.FindAsync(id, cancellationToken);
        if (reader is null) return null;

        await EnsureIdentifierIsUniqueAsync(input.Identifier, id, cancellationToken);
        reader.Update(input.Name, input.Identifier, input.Email, input.Phone, input.Course, input.Notes);
        await repository.SaveAsync(reader, cancellationToken);
        return Map(reader);
    }

    public async Task<ReaderDto?> SetStatusAsync(Guid id, string status, CancellationToken cancellationToken = default)
    {
        var reader = await repository.FindAsync(id, cancellationToken);
        if (reader is null) return null;
        if (!Enum.TryParse<ReaderStatus>(status, true, out var parsedStatus))
            throw new DomainException("Status de leitor inválido. Use REGULAR, SUSPENDED ou BLOCKED.");

        reader.SetStatus(parsedStatus);
        await repository.SaveAsync(reader, cancellationToken);
        return Map(reader);
    }

    private async Task EnsureIdentifierIsUniqueAsync(string identifier, Guid? currentId, CancellationToken cancellationToken)
    {
        var normalized = identifier.Trim().ToLowerInvariant();
        var exists = repository.Query().Any(reader => reader.Identifier.ToLower() == normalized && reader.Id != currentId);
        await Task.CompletedTask;
        cancellationToken.ThrowIfCancellationRequested();
        if (exists) throw new DomainException($"Já existe um leitor cadastrado com a matrícula/identificador \"{identifier.Trim()}\".");
    }

    private static ReaderDto Map(Reader reader) => new(
        reader.Id, reader.Name, reader.Identifier, reader.Email, reader.Phone, reader.Course, reader.Notes,
        reader.RegistrationDate, reader.Status.ToString().ToUpperInvariant(), reader.ActiveLoansCount);
}
