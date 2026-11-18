using Biblioteca.Domain;
using Microsoft.EntityFrameworkCore;

namespace Biblioteca.Infrastructure;

public sealed class Category { public long CategoryId { get; set; } public required string Name { get; set; } public bool IsActive { get; set; } = true; }
public sealed class Author { public long AuthorId { get; set; } public required string Name { get; set; } }
public sealed class BookAuthor { public long BookId { get; set; } public long AuthorId { get; set; } }
public sealed class Loan { public long LoanId { get; set; } public long CopyId { get; set; } public long ReaderId { get; set; } public DateTime LoanedAt { get; set; } public DateTime DueAt { get; set; } public DateTime? ReturnedAt { get; set; } }
public sealed class Publisher { public long PublisherId { get; set; } public required string Name { get; set; } }
public sealed class Genre { public long GenreId { get; set; } public required string Name { get; set; } }
public sealed class BookGenre { public long BookId { get; set; } public long GenreId { get; set; } }
public sealed class Reservation { public long ReservationId { get; set; } public long BookId { get; set; } public long ReaderId { get; set; } public DateTime ReservedAt { get; set; } public string Status { get; set; } = "ACTIVE"; }
public sealed class Fine { public long FineId { get; set; } public long LoanId { get; set; } public decimal Amount { get; set; } public DateTime CreatedAt { get; set; } public DateTime? PaidAt { get; set; } public string Reason { get; set; } = "OVERDUE"; }

public sealed class LibraryDbContext(DbContextOptions<LibraryDbContext> options) : DbContext(options)
{
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Book> Books => Set<Book>();
    public DbSet<Author> Authors => Set<Author>();
    public DbSet<BookAuthor> BookAuthors => Set<BookAuthor>();
    public DbSet<Copy> Copies => Set<Copy>();
    public DbSet<Reader> Readers => Set<Reader>();
    public DbSet<Loan> Loans => Set<Loan>();
    public DbSet<Publisher> Publishers => Set<Publisher>();
    public DbSet<Genre> Genres => Set<Genre>();
    public DbSet<BookGenre> BookGenres => Set<BookGenre>();
    public DbSet<Reservation> Reservations => Set<Reservation>();
    public DbSet<Fine> Fines => Set<Fine>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        model.Entity<Category>(e => { e.ToTable("Categories"); e.HasKey(x => x.CategoryId); e.Property(x => x.Name).HasMaxLength(100).IsRequired(); e.HasIndex(x => x.Name).IsUnique(); });
        model.Entity<Book>(e => { e.ToTable("Books"); e.HasKey(x => x.BookId); e.Property(x => x.Title).HasMaxLength(200).IsRequired(); e.Property(x => x.Isbn13).HasColumnType("char(13)").IsRequired(); e.HasIndex(x => x.Isbn13).IsUnique(); e.HasOne<Category>().WithMany().HasForeignKey(x => x.CategoryId); });
        model.Entity<Author>(e => { e.ToTable("Authors"); e.HasKey(x => x.AuthorId); e.Property(x => x.Name).HasMaxLength(150).IsRequired(); e.HasIndex(x => x.Name).IsUnique(); });
        model.Entity<BookAuthor>(e => { e.ToTable("BookAuthors"); e.HasKey(x => new { x.BookId, x.AuthorId }); e.HasOne<Book>().WithMany().HasForeignKey(x => x.BookId); e.HasOne<Author>().WithMany().HasForeignKey(x => x.AuthorId); });
        model.Entity<Copy>(e => { e.ToTable("Copies"); e.HasKey(x => x.CopyId); e.Property(x => x.InventoryCode).HasMaxLength(40).IsRequired(); e.Property(x => x.Status).HasConversion<string>().HasMaxLength(20); e.HasIndex(x => x.InventoryCode).IsUnique(); e.HasOne<Book>().WithMany().HasForeignKey(x => x.BookId); });
        model.Entity<Reader>(e => { e.ToTable("Readers"); e.HasKey(x => x.ReaderId); e.Property(x => x.FullName).HasMaxLength(150).IsRequired(); e.Property(x => x.RegistrationNumber).HasMaxLength(30).IsRequired(); e.HasIndex(x => x.RegistrationNumber).IsUnique(); });
        model.Entity<Loan>(e => { e.ToTable("Loans"); e.HasKey(x => x.LoanId); e.HasOne<Copy>().WithMany().HasForeignKey(x => x.CopyId); e.HasOne<Reader>().WithMany().HasForeignKey(x => x.ReaderId); e.HasIndex(x => new { x.CopyId, x.ReturnedAt }); e.HasIndex(x => new { x.ReaderId, x.ReturnedAt }); });
        model.Entity<Publisher>(e => { e.ToTable("Publishers"); e.HasKey(x => x.PublisherId); e.Property(x => x.Name).HasMaxLength(150).IsRequired(); e.HasIndex(x => x.Name).IsUnique(); });
        model.Entity<Genre>(e => { e.ToTable("Genres"); e.HasKey(x => x.GenreId); e.Property(x => x.Name).HasMaxLength(100).IsRequired(); e.HasIndex(x => x.Name).IsUnique(); });
        model.Entity<BookGenre>(e => { e.ToTable("BookGenres"); e.HasKey(x => new { x.BookId, x.GenreId }); e.HasOne<Book>().WithMany().HasForeignKey(x => x.BookId); e.HasOne<Genre>().WithMany().HasForeignKey(x => x.GenreId); });
        model.Entity<Reservation>(e => { e.ToTable("Reservations"); e.HasKey(x => x.ReservationId); e.Property(x => x.Status).HasMaxLength(20).IsRequired(); e.HasOne<Book>().WithMany().HasForeignKey(x => x.BookId); e.HasOne<Reader>().WithMany().HasForeignKey(x => x.ReaderId); e.HasIndex(x => new { x.BookId, x.Status }); });
        model.Entity<Fine>(e => { e.ToTable("Fines"); e.HasKey(x => x.FineId); e.Property(x => x.Amount).HasPrecision(10, 2); e.Property(x => x.Reason).HasMaxLength(200).IsRequired(); e.HasOne<Loan>().WithMany().HasForeignKey(x => x.LoanId); e.HasIndex(x => x.LoanId).IsUnique(); });
    }
}
