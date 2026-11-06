using Biblioteca.Domain.Enums;

namespace Biblioteca.Domain.Entities;

public sealed class Reader
{
    private Reader() { }

    public Reader(string name, string identifier, string? email = null, string? phone = null, string? course = null, string? notes = null)
    {
        Id = Guid.NewGuid();
        RegistrationDate = DateOnly.FromDateTime(DateTime.UtcNow);
        Update(name, identifier, email, phone, course, notes);
    }

    public Guid Id { get; private set; }
    public string Name { get; private set; } = string.Empty;
    public string Identifier { get; private set; } = string.Empty;
    public string? Email { get; private set; }
    public string? Phone { get; private set; }
    public string? Course { get; private set; }
    public string? Notes { get; private set; }
    public DateOnly RegistrationDate { get; private set; }
    public ReaderStatus Status { get; private set; } = ReaderStatus.Regular;
    public int ActiveLoansCount { get; private set; }

    public void Update(string name, string identifier, string? email, string? phone, string? course, string? notes)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new DomainException("O nome completo do leitor é obrigatório.");
        if (string.IsNullOrWhiteSpace(identifier)) throw new DomainException("A matrícula ou identificador acadêmico é obrigatório.");
        if (!ReaderValidator.IsValidEmail(email)) throw new DomainException("O formato do e-mail informado é inválido.");
        if (!ReaderValidator.IsValidPhone(phone)) throw new DomainException("O formato do telefone informado é inválido.");

        Name = name.Trim();
        Identifier = identifier.Trim();
        Email = NormalizeOptional(email);
        Phone = NormalizeOptional(phone);
        Course = NormalizeOptional(course);
        Notes = NormalizeOptional(notes);
    }

    public void SetStatus(ReaderStatus status) => Status = status;

    public void RegisterLoan()
    {
        if (Status != ReaderStatus.Regular)
            throw new DomainException("O leitor não está elegível para realizar empréstimos.");

        ActiveLoansCount++;
    }

    public void RegisterReturn()
    {
        if (ActiveLoansCount == 0)
            throw new DomainException("O leitor não possui empréstimos ativos para esta devolução.");

        ActiveLoansCount--;
    }

    private static string? NormalizeOptional(string? value) => string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
