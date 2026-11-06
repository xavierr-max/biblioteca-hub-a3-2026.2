using Biblioteca.Application.DTOs;
using Biblioteca.Application.Services;
using Biblioteca.Domain;

namespace Biblioteca.Api.Extensions;

public static class BookEndpointExtensions
{
    public static IEndpointRouteBuilder MapBookEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/books", ListAsync);
        endpoints.MapGet("/api/books/{id:guid}", GetAsync);
        endpoints.MapPost("/api/books", CreateAsync);
        endpoints.MapPut("/api/books/{id:guid}", UpdateAsync);
        endpoints.MapPost("/api/books/{id:guid}/archive", ArchiveAsync);
        return endpoints;
    }

    private static async Task<IResult> ListAsync(string? search, BookService service, CancellationToken cancellationToken)
        => Results.Ok(await service.ListAsync(search, cancellationToken));

    private static async Task<IResult> GetAsync(Guid id, BookService service, CancellationToken cancellationToken)
        => (await service.GetAsync(id, cancellationToken)) is { } book ? Results.Ok(book) : Results.NotFound();

    private static async Task<IResult> CreateAsync(BookInput input, BookService service, CancellationToken cancellationToken)
    {
        try
        {
            var book = await service.CreateAsync(input, cancellationToken);
            return Results.Created($"/api/books/{book.Id}", book);
        }
        catch (DomainException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> UpdateAsync(Guid id, BookInput input, BookService service, CancellationToken cancellationToken)
    {
        try
        {
            var book = await service.UpdateAsync(id, input, cancellationToken);
            return book is null ? Results.NotFound() : Results.Ok(book);
        }
        catch (DomainException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> ArchiveAsync(Guid id, BookService service, CancellationToken cancellationToken)
        => await service.ArchiveAsync(id, cancellationToken) ? Results.NoContent() : Results.NotFound();
}
