using Biblioteca.Domain.Enums;

namespace Biblioteca.Domain.Entities;

public sealed class BookCopy
{
    private BookCopy() { }

    internal BookCopy(Guid bookId)
    {
        Id = Guid.NewGuid();
        BookId = bookId;
        Code = $"EX-{Id:N}"[..9].ToUpperInvariant();
    }

    public Guid Id { get; private set; }
    public Guid BookId { get; private set; }
    public string Code { get; private set; } = string.Empty;
    public CopyStatus Status { get; private set; } = CopyStatus.Available;
    public string Location { get; private set; } = "Estante Geral";

    public void ChangeStatus(CopyStatus status, string? location = null)
    {
        if (Status == CopyStatus.Loaned && status == CopyStatus.Available)
            throw new DomainException("Exemplar emprestado só pode ser liberado por devolução.");

        Status = status;
        if (location is not null) Location = location.Trim();
    }

    public void MarkAsLoaned()
    {
        if (Status != CopyStatus.Available)
            throw new DomainException($"O exemplar {Code} não está disponível para empréstimo.");

        Status = CopyStatus.Loaned;
    }

    public void ReleaseFromReturn()
    {
        if (Status != CopyStatus.Loaned)
            throw new DomainException($"O exemplar {Code} não está marcado como emprestado.");

        Status = CopyStatus.Available;
    }
}
