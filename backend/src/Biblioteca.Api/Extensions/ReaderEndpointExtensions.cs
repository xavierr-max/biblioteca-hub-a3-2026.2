using Biblioteca.Application.DTOs;
using Biblioteca.Application.Services;
using Biblioteca.Domain;

namespace Biblioteca.Api.Extensions;

public static class ReaderEndpointExtensions
{
    public static IEndpointRouteBuilder MapReaderEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/readers", ListAsync);
        endpoints.MapGet("/api/readers/{id:guid}", GetAsync);
        endpoints.MapPost("/api/readers", CreateAsync);
        endpoints.MapPut("/api/readers/{id:guid}", UpdateAsync);
        endpoints.MapPatch("/api/readers/{id:guid}/status", SetStatusAsync);
        return endpoints;
    }

    private static async Task<IResult> ListAsync(string? search, ReaderService service, CancellationToken cancellationToken)
        => Results.Ok(await service.ListAsync(search, cancellationToken));

    private static async Task<IResult> GetAsync(Guid id, ReaderService service, CancellationToken cancellationToken)
        => (await service.GetAsync(id, cancellationToken)) is { } reader ? Results.Ok(reader) : Results.NotFound();

    private static async Task<IResult> CreateAsync(ReaderInput input, ReaderService service, CancellationToken cancellationToken)
    {
        try
        {
            var reader = await service.CreateAsync(input, cancellationToken);
            return Results.Created($"/api/readers/{reader.Id}", reader);
        }
        catch (DomainException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> UpdateAsync(Guid id, ReaderInput input, ReaderService service, CancellationToken cancellationToken)
    {
        try
        {
            var reader = await service.UpdateAsync(id, input, cancellationToken);
            return reader is null ? Results.NotFound() : Results.Ok(reader);
        }
        catch (DomainException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> SetStatusAsync(Guid id, ReaderStatusInput input, ReaderService service, CancellationToken cancellationToken)
    {
        try
        {
            var reader = await service.SetStatusAsync(id, input.Status, cancellationToken);
            return reader is null ? Results.NotFound() : Results.Ok(reader);
        }
        catch (DomainException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }
}
