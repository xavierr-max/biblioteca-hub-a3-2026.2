using Biblioteca.Domain.Enums;

namespace Biblioteca.Domain.Entities;

public sealed class Loan
{
    private Loan() { }

    public Loan(Book book, BookCopy copy, Reader reader, DateOnly loanDate, DateOnly dueDate)
    {
        if (loanDate > DateOnly.FromDateTime(DateTime.UtcNow))
            throw new DomainException("A data do empréstimo não pode estar no futuro.");
        if (dueDate <= loanDate)
            throw new DomainException("A previsão de devolução deve ser posterior à data do empréstimo.");

        Id = Guid.NewGuid();
        BookId = book.Id;
        BookTitle = book.Title;
        CopyId = copy.Id;
        CopyCode = copy.Code;
        ReaderId = reader.Id;
        ReaderName = reader.Name;
        LoanDate = loanDate;
        DueDate = dueDate;
        Status = LoanStatus.Active;
    }

    public Guid Id { get; private set; }
    public Guid BookId { get; private set; }
    public string BookTitle { get; private set; } = string.Empty;
    public Guid CopyId { get; private set; }
    public string CopyCode { get; private set; } = string.Empty;
    public Guid ReaderId { get; private set; }
    public string ReaderName { get; private set; } = string.Empty;
    public DateOnly LoanDate { get; private set; }
    public DateOnly DueDate { get; private set; }
    public DateOnly? ReturnDate { get; private set; }
    public LoanStatus Status { get; private set; }

    public void RegisterReturn(DateOnly returnDate)
    {
        if (Status == LoanStatus.Returned || ReturnDate.HasValue)
            throw new DomainException("Este empréstimo já possui uma devolução registrada.");
        if (returnDate < LoanDate)
            throw new DomainException("A data de devolução não pode ser anterior à data do empréstimo.");
        if (returnDate > DateOnly.FromDateTime(DateTime.UtcNow))
            throw new DomainException("A data de devolução não pode estar no futuro.");

        ReturnDate = returnDate;
        Status = LoanStatus.Returned;
    }
}
