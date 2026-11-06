namespace Biblioteca.Application.DTOs;

public sealed record BookInput(string Title, string Author, string Isbn, string? Category, string? Publisher, int Year, int TotalCopies, string? Notes);

public sealed record BookDto(Guid Id, string Title, string Author, string Isbn, string Category, string Publisher, int Year, int TotalCopies, int AvailableCopies, bool IsArchived, IReadOnlyList<CopyDto> Copies);

public sealed record CopyDto(Guid Id, string Code, string Status, string Location);
