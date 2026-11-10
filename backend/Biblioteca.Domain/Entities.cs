namespace Biblioteca.Domain;

public sealed class Book
{
    public long BookId { get; set; }
    public required string Title { get; set; }
    public required string Isbn13 { get; set; }
    public long CategoryId { get; set; }
    public bool IsArchived { get; set; }
}

public sealed class Reader
{
    public long ReaderId { get; set; }
    public required string FullName { get; set; }
    public required string RegistrationNumber { get; set; }
    public bool IsSuspended { get; set; }
}

public sealed class Copy
{
    public long CopyId { get; set; }
    public long BookId { get; set; }
    public required string InventoryCode { get; set; }
    public CopyStatus Status { get; set; } = CopyStatus.Available;
}

public enum CopyStatus { Available, Loaned, Maintenance, Lost }
