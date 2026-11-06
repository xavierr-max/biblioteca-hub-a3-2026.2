using Biblioteca.Application.DTOs;
using Biblioteca.Application.Services;
using Biblioteca.Domain;

namespace Biblioteca.Api.Extensions;

public static class LoanEndpointExtensions
{
    public static IEndpointRouteBuilder MapLoanEndpoints(this IEndpointRouteBuilder endpoints)
    {
        endpoints.MapGet("/api/loans", ListAsync);
        endpoints.MapGet("/api/loans/{id:guid}", GetAsync);
        endpoints.MapPost("/api/loans", CreateAsync);
        endpoints.MapPost("/api/loans/{id:guid}/return", ReturnAsync);
        return endpoints;
    }

    private static async Task<IResult> ListAsync(string? status, LoanService service, CancellationToken cancellationToken)
        => Results.Ok(await service.ListAsync(status, cancellationToken));

    private static async Task<IResult> GetAsync(Guid id, LoanService service, CancellationToken cancellationToken)
        => (await service.GetAsync(id, cancellationToken)) is { } loan ? Results.Ok(loan) : Results.NotFound();

    private static async Task<IResult> CreateAsync(LoanInput input, LoanService service, CancellationToken cancellationToken)
    {
        try
        {
            var loan = await service.CreateAsync(input, cancellationToken);
            return Results.Created($"/api/loans/{loan.Id}", loan);
        }
        catch (DomainException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }

    private static async Task<IResult> ReturnAsync(Guid id, ReturnInput input, LoanService service, CancellationToken cancellationToken)
    {
        try
        {
            var loan = await service.ReturnAsync(id, input, cancellationToken);
            return loan is null ? Results.NotFound() : Results.Ok(loan);
        }
        catch (DomainException exception)
        {
            return Results.BadRequest(new { error = exception.Message });
        }
    }
}
