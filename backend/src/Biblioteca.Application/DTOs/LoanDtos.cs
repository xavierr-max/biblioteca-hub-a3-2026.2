namespace Biblioteca.Application.DTOs;

public sealed record LoanInput(Guid ReaderId, Guid CopyId, DateOnly LoanDate, DateOnly DueDate);

public sealed record ReturnInput(DateOnly ReturnDate);

public sealed record LoanDto(
    Guid Id,
    Guid BookId,
    string BookTitle,
    Guid CopyId,
    string CopyCode,
    Guid ReaderId,
    string ReaderName,
    DateOnly LoanDate,
    DateOnly DueDate,
    DateOnly? ReturnDate,
    string Status);
