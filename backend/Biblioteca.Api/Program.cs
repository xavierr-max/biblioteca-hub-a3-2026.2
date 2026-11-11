using Biblioteca.Domain;
using Biblioteca.Infrastructure;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOpenApi();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddCors(options => options.AddPolicy("Frontend", policy => policy
    .WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
    .AllowAnyHeader()
    .AllowAnyMethod()));
var app = builder.Build();
app.UseCors("Frontend");
if (app.Environment.IsDevelopment()) app.MapOpenApi();

app.MapGet("/api/health", () => Results.Ok(new { status = "ok", service = "biblioteca-api" }));
app.MapGet("/api/books",
    async (LibraryDbContext db, CancellationToken ct) =>
        Results.Ok(await db.Books.AsNoTracking().OrderBy(x => x.Title).Select(x => new BookDetails(x.BookId, x.Title, x.Isbn13, x.CategoryId, db.Categories.Where(c => c.CategoryId == x.CategoryId).Select(c => c.Name).FirstOrDefault() ?? "Sem categoria", x.IsArchived, db.BookAuthors.Where(ba => ba.BookId == x.BookId).Join(db.Authors, ba => ba.AuthorId, a => a.AuthorId, (_, a) => new AuthorDetails(a.AuthorId, a.Name)).ToList())).ToListAsync(ct)));
app.MapGet("/api/categories", async (LibraryDbContext db, CancellationToken ct) => Results.Ok(await db.Categories.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct)));
app.MapPost("/api/categories", async (CategoryRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Name)) return Results.BadRequest(new { error = "Category name is required." });
    if (await db.Categories.AnyAsync(x => x.Name == request.Name.Trim(), ct)) return Results.Conflict(new { error = "Category already exists." });
    var category = new Category { Name = request.Name.Trim(), IsActive = request.IsActive };
    db.Categories.Add(category); await db.SaveChangesAsync(ct); return Results.Created($"/api/categories/{category.CategoryId}", category);
});
app.MapPut("/api/categories/{id:long}", async (long id, CategoryRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    var category = await db.Categories.FindAsync([id], ct); if (category is null) return Results.NotFound();
    if (string.IsNullOrWhiteSpace(request.Name)) return Results.BadRequest(new { error = "Category name is required." });
    category.Name = request.Name.Trim(); category.IsActive = request.IsActive; await db.SaveChangesAsync(ct); return Results.Ok(category);
});
app.MapDelete("/api/categories/{id:long}", async (long id, LibraryDbContext db, CancellationToken ct) =>
{
    var category = await db.Categories.FindAsync([id], ct); if (category is null) return Results.NotFound();
    if (await db.Books.AnyAsync(x => x.CategoryId == id && !x.IsArchived, ct)) return Results.Conflict(new { error = "Category has active books." });
    db.Categories.Remove(category); await db.SaveChangesAsync(ct); return Results.NoContent();
});
app.MapGet("/api/authors", async (LibraryDbContext db, CancellationToken ct) => Results.Ok(await db.Authors.AsNoTracking().OrderBy(x => x.Name).ToListAsync(ct)));
app.MapPost("/api/authors", async (AuthorRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Name)) return Results.BadRequest(new { error = "Author name is required." });
    if (await db.Authors.AnyAsync(x => x.Name == request.Name.Trim(), ct)) return Results.Conflict(new { error = "Author already exists." });
    var author = new Author { Name = request.Name.Trim() }; db.Authors.Add(author); await db.SaveChangesAsync(ct); return Results.Created($"/api/authors/{author.AuthorId}", author);
});
app.MapPut("/api/authors/{id:long}", async (long id, AuthorRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    var author = await db.Authors.FindAsync([id], ct); if (author is null) return Results.NotFound();
    if (string.IsNullOrWhiteSpace(request.Name)) return Results.BadRequest(new { error = "Author name is required." });
    author.Name = request.Name.Trim(); await db.SaveChangesAsync(ct); return Results.Ok(author);
});
app.MapDelete("/api/authors/{id:long}", async (long id, LibraryDbContext db, CancellationToken ct) =>
{
    var author = await db.Authors.FindAsync([id], ct); if (author is null) return Results.NotFound();
    db.Authors.Remove(author); await db.SaveChangesAsync(ct); return Results.NoContent();
});
app.MapPost("/api/books", async (CreateBookRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.Title) || request.Isbn13 is not { Length: 13 } ||
        !request.Isbn13.All(char.IsDigit))
        return Results.BadRequest(new { error = "Title and a valid ISBN-13 are required." });
    if (!await db.Categories.AnyAsync(x => x.CategoryId == request.CategoryId, ct))
        return Results.BadRequest(new { error = "Category not found." });
    if (await db.Books.AnyAsync(x => x.Isbn13 == request.Isbn13, ct))
        return Results.Conflict(new { error = "ISBN already exists." });
    var book = new Book { Title = request.Title.Trim(), Isbn13 = request.Isbn13, CategoryId = request.CategoryId };
    db.Books.Add(book);
    await db.SaveChangesAsync(ct);
    if (request.AuthorIds is not null) { db.BookAuthors.AddRange(request.AuthorIds.Distinct().Select(authorId => new BookAuthor { BookId = book.BookId, AuthorId = authorId })); await db.SaveChangesAsync(ct); }
    return Results.Created($"/api/books/{book.BookId}", book);
});
app.MapPut("/api/books/{id:long}", async (long id, UpdateBookRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    var book = await db.Books.SingleOrDefaultAsync(x => x.BookId == id, ct);
    if (book is null) return Results.NotFound();
    if (string.IsNullOrWhiteSpace(request.Title) || request.Isbn13 is not { Length: 13 } || !request.Isbn13.All(char.IsDigit)) return Results.BadRequest(new { error = "Title and a valid ISBN-13 are required." });
    if (!await db.Categories.AnyAsync(x => x.CategoryId == request.CategoryId, ct)) return Results.BadRequest(new { error = "Category not found." });
    if (await db.Books.AnyAsync(x => x.BookId != id && x.Isbn13 == request.Isbn13, ct)) return Results.Conflict(new { error = "ISBN already exists." });
    book.Title = request.Title.Trim(); book.Isbn13 = request.Isbn13; book.CategoryId = request.CategoryId; book.IsArchived = request.IsArchived;
    db.BookAuthors.RemoveRange(db.BookAuthors.Where(x => x.BookId == id));
    if (request.AuthorIds is not null) db.BookAuthors.AddRange(request.AuthorIds.Distinct().Select(authorId => new BookAuthor { BookId = id, AuthorId = authorId }));
    await db.SaveChangesAsync(ct); return Results.Ok(book);
});
app.MapDelete("/api/books/{id:long}", async (long id, LibraryDbContext db, CancellationToken ct) =>
{
    var book = await db.Books.SingleOrDefaultAsync(x => x.BookId == id, ct);
    if (book is null) return Results.NotFound();
    if (await db.Copies.AnyAsync(x => x.BookId == id && x.Status == CopyStatus.Loaned, ct)) return Results.Conflict(new { error = "Book has loaned copies." });
    book.IsArchived = true; await db.SaveChangesAsync(ct); return Results.NoContent();
});
app.MapGet("/api/readers",
    async (LibraryDbContext db, CancellationToken ct) =>
        Results.Ok(await db.Readers.AsNoTracking().OrderBy(x => x.FullName).ToListAsync(ct)));
app.MapPost("/api/readers", async (CreateReaderRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.RegistrationNumber))
        return Results.BadRequest(new { error = "Name and registration number are required." });
    if (await db.Readers.AnyAsync(x => x.RegistrationNumber == request.RegistrationNumber, ct))
        return Results.Conflict(new { error = "Registration number already exists." });
    var reader = new Reader
        { FullName = request.FullName.Trim(), RegistrationNumber = request.RegistrationNumber.Trim() };
    db.Readers.Add(reader);
    await db.SaveChangesAsync(ct);
    return Results.Created($"/api/readers/{reader.ReaderId}", reader);
});
app.MapPut("/api/readers/{id:long}", async (long id, UpdateReaderRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    var reader = await db.Readers.SingleOrDefaultAsync(x => x.ReaderId == id, ct);
    if (reader is null) return Results.NotFound();
    if (string.IsNullOrWhiteSpace(request.FullName) || string.IsNullOrWhiteSpace(request.RegistrationNumber)) return Results.BadRequest(new { error = "Name and registration number are required." });
    if (await db.Readers.AnyAsync(x => x.ReaderId != id && x.RegistrationNumber == request.RegistrationNumber, ct)) return Results.Conflict(new { error = "Registration number already exists." });
    reader.FullName = request.FullName.Trim(); reader.RegistrationNumber = request.RegistrationNumber.Trim(); reader.IsSuspended = request.IsSuspended;
    await db.SaveChangesAsync(ct); return Results.Ok(reader);
});
app.MapDelete("/api/readers/{id:long}", async (long id, LibraryDbContext db, CancellationToken ct) =>
{
    var reader = await db.Readers.SingleOrDefaultAsync(x => x.ReaderId == id, ct);
    if (reader is null) return Results.NotFound();
    if (await db.Loans.AnyAsync(x => x.ReaderId == id && x.ReturnedAt == null, ct)) return Results.Conflict(new { error = "Reader has active loans." });
    db.Readers.Remove(reader); await db.SaveChangesAsync(ct); return Results.NoContent();
});
app.MapGet("/api/copies",
    async (LibraryDbContext db, CancellationToken ct) =>
        Results.Ok(await db.Copies.AsNoTracking().OrderBy(x => x.InventoryCode).ToListAsync(ct)));
app.MapPost("/api/copies", async (CreateCopyRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    if (string.IsNullOrWhiteSpace(request.InventoryCode))
        return Results.BadRequest(new { error = "Inventory code is required." });
    if (!await db.Books.AnyAsync(x => x.BookId == request.BookId && !x.IsArchived, ct))
        return Results.BadRequest(new { error = "Book not found or archived." });
    if (await db.Copies.AnyAsync(x => x.InventoryCode == request.InventoryCode, ct))
        return Results.Conflict(new { error = "Inventory code already exists." });
    var copy = new Copy { BookId = request.BookId, InventoryCode = request.InventoryCode.Trim() };
    db.Copies.Add(copy);
    await db.SaveChangesAsync(ct);
    return Results.Created($"/api/copies/{copy.CopyId}", copy);
});
app.MapPut("/api/copies/{id:long}", async (long id, UpdateCopyRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    var copy = await db.Copies.SingleOrDefaultAsync(x => x.CopyId == id, ct);
    if (copy is null) return Results.NotFound();
    if (string.IsNullOrWhiteSpace(request.InventoryCode)) return Results.BadRequest(new { error = "Inventory code is required." });
    if (!await db.Books.AnyAsync(x => x.BookId == request.BookId && !x.IsArchived, ct)) return Results.BadRequest(new { error = "Book not found or archived." });
    if (await db.Copies.AnyAsync(x => x.CopyId != id && x.InventoryCode == request.InventoryCode, ct)) return Results.Conflict(new { error = "Inventory code already exists." });
    copy.BookId = request.BookId; copy.InventoryCode = request.InventoryCode.Trim(); copy.Status = request.Status;
    await db.SaveChangesAsync(ct); return Results.Ok(copy);
});
app.MapDelete("/api/copies/{id:long}", async (long id, LibraryDbContext db, CancellationToken ct) =>
{
    var copy = await db.Copies.SingleOrDefaultAsync(x => x.CopyId == id, ct);
    if (copy is null) return Results.NotFound();
    if (copy.Status == CopyStatus.Loaned) return Results.Conflict(new { error = "Copy is currently loaned." });
    db.Copies.Remove(copy); await db.SaveChangesAsync(ct); return Results.NoContent();
});
app.MapGet("/api/loans",
    async (LibraryDbContext db, CancellationToken ct) =>
        Results.Ok(await db.Loans.AsNoTracking().OrderByDescending(x => x.LoanedAt).ToListAsync(ct)));
app.MapPost("/api/loans", async (CreateLoanRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    await using var transaction = await db.Database.BeginTransactionAsync(ct);
    var reader = await db.Readers.SingleOrDefaultAsync(x => x.ReaderId == request.ReaderId, ct);
    var copy = await db.Copies.SingleOrDefaultAsync(x => x.CopyId == request.CopyId, ct);
    if (reader is null || copy is null) return Results.NotFound(new { error = "Reader or copy not found." });
    var activeLoans = await db.Loans.CountAsync(x => x.ReaderId == request.ReaderId && x.ReturnedAt == null, ct);
    var decision = LoanRules.Validate(reader, copy, activeLoans);
    if (!decision.Allowed) return Results.BadRequest(decision);
    var loanedAt = DateTime.UtcNow;
    var loan = new Loan
        { ReaderId = request.ReaderId, CopyId = request.CopyId, LoanedAt = loanedAt, DueAt = loanedAt.AddDays(14) };
    copy.Status = CopyStatus.Loaned;
    db.Loans.Add(loan);
    await db.SaveChangesAsync(ct);
    await transaction.CommitAsync(ct);
    return Results.Created($"/api/loans/{loan.LoanId}", loan);
});
app.MapPut("/api/loans/{id:long}", async (long id, UpdateLoanRequest request, LibraryDbContext db, CancellationToken ct) =>
{
    var loan = await db.Loans.SingleOrDefaultAsync(x => x.LoanId == id, ct);
    if (loan is null) return Results.NotFound();
    if (!await db.Readers.AnyAsync(x => x.ReaderId == request.ReaderId, ct) || !await db.Copies.AnyAsync(x => x.CopyId == request.CopyId, ct)) return Results.BadRequest(new { error = "Reader or copy not found." });
    loan.ReaderId = request.ReaderId; loan.CopyId = request.CopyId; loan.DueAt = request.DueAt ?? loan.DueAt; loan.ReturnedAt = request.ReturnedAt;
    await db.SaveChangesAsync(ct); return Results.Ok(loan);
});
app.MapDelete("/api/loans/{id:long}", async (long id, LibraryDbContext db, CancellationToken ct) =>
{
    var loan = await db.Loans.SingleOrDefaultAsync(x => x.LoanId == id, ct);
    if (loan is null) return Results.NotFound();
    if (loan.ReturnedAt is null) { var copy = await db.Copies.SingleAsync(x => x.CopyId == loan.CopyId, ct); copy.Status = CopyStatus.Available; }
    db.Loans.Remove(loan); await db.SaveChangesAsync(ct); return Results.NoContent();
});
app.MapPost("/api/loans/{id:long}/return", async (long id, LibraryDbContext db, CancellationToken ct) =>
{
    await using var transaction = await db.Database.BeginTransactionAsync(ct);
    var loan = await db.Loans.SingleOrDefaultAsync(x => x.LoanId == id, ct);
    if (loan is null) return Results.NotFound(new { error = "Loan not found." });
    if (loan.ReturnedAt is not null) return Results.Conflict(new { error = "Loan was already returned." });
    loan.ReturnedAt = DateTime.UtcNow;
    var copy = await db.Copies.SingleAsync(x => x.CopyId == loan.CopyId, ct);
    copy.Status = CopyStatus.Available;
    await db.SaveChangesAsync(ct);
    await transaction.CommitAsync(ct);
    return Results.Ok(loan);
});
app.Run();

public sealed record CreateBookRequest(string Title, string Isbn13, long CategoryId, long[]? AuthorIds = null);
public sealed record UpdateBookRequest(string Title, string Isbn13, long CategoryId, bool IsArchived, long[]? AuthorIds = null);
public sealed record CategoryRequest(string Name, bool IsActive = true);
public sealed record AuthorRequest(string Name);
public sealed record AuthorDetails(long AuthorId, string Name);
public sealed record BookDetails(long BookId, string Title, string Isbn13, long CategoryId, string CategoryName, bool IsArchived, List<AuthorDetails> Authors);

public sealed record CreateReaderRequest(string FullName, string RegistrationNumber);
public sealed record UpdateReaderRequest(string FullName, string RegistrationNumber, bool IsSuspended);

public sealed record CreateCopyRequest(long BookId, string InventoryCode);
public sealed record UpdateCopyRequest(long BookId, string InventoryCode, CopyStatus Status);

public sealed record CreateLoanRequest(long ReaderId, long CopyId);
public sealed record UpdateLoanRequest(long ReaderId, long CopyId, DateTime? DueAt, DateTime? ReturnedAt);
