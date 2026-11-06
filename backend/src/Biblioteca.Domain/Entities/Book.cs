using Biblioteca.Domain.Enums;

namespace Biblioteca.Domain.Entities;

public sealed class Book
{
    private Book() { }

    public Book(string title, string author, string isbn, string category, string publisher, int year, int totalCopies, string? notes = null)
    {
        Id = Guid.NewGuid();
        Update(title, author, isbn, category, publisher, year, totalCopies, notes);
    }

    public Guid Id { get; private set; }
    public string Title { get; private set; } = string.Empty;
    public string Author { get; private set; } = string.Empty;
    public string Isbn { get; private set; } = string.Empty;
    public string Category { get; private set; } = "Geral";
    public string Publisher { get; private set; } = "Editora Independente";
    public int Year { get; private set; }
    public bool IsArchived { get; private set; }
    public string? Notes { get; private set; }
    public List<BookCopy> Copies { get; private set; } = [];

    public void Update(string title, string author, string isbn, string category, string publisher, int year, int totalCopies, string? notes)
    {
        if (string.IsNullOrWhiteSpace(title)) throw new DomainException("O título do livro é obrigatório.");
        if (string.IsNullOrWhiteSpace(author)) throw new DomainException("O autor do livro é obrigatório.");
        if (!IsbnValidator.IsValid(isbn)) throw new DomainException("ISBN inválido.");
        if (totalCopies < 0) throw new DomainException("A quantidade de exemplares não pode ser negativa.");

        var loanedCopies = Copies.Count(copy => copy.Status == CopyStatus.Loaned);
        if (totalCopies < loanedCopies) throw new DomainException("Não é possível reduzir abaixo dos exemplares emprestados.");

        Title = title.Trim();
        Author = author.Trim();
        Isbn = IsbnValidator.Clean(isbn);
        Category = string.IsNullOrWhiteSpace(category) ? "Geral" : category.Trim();
        Publisher = publisher.Trim();
        Year = year;
        Notes = notes?.Trim();

        while (Copies.Count < totalCopies) Copies.Add(new BookCopy(Id));
        while (Copies.Count > totalCopies && Copies[^1].Status == CopyStatus.Available) Copies.RemoveAt(Copies.Count - 1);
    }

    public void Archive() => IsArchived = true;
}
