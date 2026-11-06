using Biblioteca.Application.DTOs;
using Biblioteca.Application.Interfaces;
using Biblioteca.Domain;
using Biblioteca.Domain.Entities;
using Biblioteca.Domain.Enums;

namespace Biblioteca.Application.Services;

public sealed class BookService(IBookRepository repository)
{
    public async Task<IReadOnlyList<BookDto>> ListAsync(string? search, CancellationToken cancellationToken = default)
    {
        var query = repository.Query();
        if (!string.IsNullOrWhiteSpace(search))
        {
            query = query.Where(book => book.Title.Contains(search) || book.Author.Contains(search) || book.Isbn.Contains(search));
        }

        cancellationToken.ThrowIfCancellationRequested();
        var books = await Task.FromResult(query.ToList());
        return books.Select(Map).ToList();
    }

    public async Task<BookDto?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var book = await repository.FindAsync(id, cancellationToken);
        return book is null ? null : Map(book);
    }

    public async Task<BookDto> CreateAsync(BookInput input, CancellationToken cancellationToken = default)
    {
        var book = new Book(input.Title, input.Author, input.Isbn, input.Category ?? "Geral", input.Publisher ?? "Editora Independente", input.Year, input.TotalCopies, input.Notes);
        if (repository.Query().Any(item => item.Isbn == book.Isbn))
            throw new DomainException("Já existe um livro cadastrado com este ISBN.");

        await repository.SaveAsync(book, cancellationToken);
        return Map(book);
    }

    public async Task<BookDto?> UpdateAsync(Guid id, BookInput input, CancellationToken cancellationToken = default)
    {
        var book = await repository.FindAsync(id, cancellationToken);
        if (book is null) return null;

        var isbn = IsbnValidator.Clean(input.Isbn);
        if (repository.Query().Any(item => item.Id != id && item.Isbn == isbn))
            throw new DomainException("Já existe outro livro cadastrado com este ISBN.");

        book.Update(input.Title, input.Author, isbn, input.Category ?? "Geral", input.Publisher ?? "Editora Independente", input.Year, input.TotalCopies, input.Notes);
        await repository.SaveAsync(book, cancellationToken);
        return Map(book);
    }

    public async Task<bool> ArchiveAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var book = await repository.FindAsync(id, cancellationToken);
        if (book is null) return false;
        book.Archive();
        await repository.SaveAsync(book, cancellationToken);
        return true;
    }

    private static BookDto Map(Book book) => new(
        book.Id, book.Title, book.Author, book.Isbn, book.Category, book.Publisher, book.Year,
        book.Copies.Count, book.Copies.Count(copy => copy.Status == CopyStatus.Available), book.IsArchived,
        book.Copies.Select(copy => new CopyDto(copy.Id, copy.Code, copy.Status.ToString(), copy.Location)).ToList());
}
