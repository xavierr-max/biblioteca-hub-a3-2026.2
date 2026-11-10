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
        Results.Ok(await db.Books.AsNoTracking().OrderBy(x => x.Title).ToListAsync(ct)));
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
    return Results.Created($"/api/books/{book.BookId}", book);
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

public sealed record CreateBookRequest(string Title, string Isbn13, long CategoryId);

public sealed record CreateReaderRequest(string FullName, string RegistrationNumber);

public sealed record CreateCopyRequest(long BookId, string InventoryCode);

public sealed record CreateLoanRequest(long ReaderId, long CopyId);
