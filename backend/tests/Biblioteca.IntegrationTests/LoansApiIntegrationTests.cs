using System.Net;
using System.Net.Http.Json;
using Biblioteca.Application.DTOs;

namespace Biblioteca.IntegrationTests;

public sealed class LoansApiIntegrationTests
{
    private static BookInput BookInput() => new("Clean Code", "Robert Martin", "9780306406157", "Técnico", "Prentice", 2008, 1, null);

    private static async Task<(BookDto Book, ReaderDto Reader, HttpClient Client)> SeedAsync(ApiFactory factory)
    {
        var client = factory.CreateClient();
        var book = await (await client.PostAsJsonAsync("/api/books", BookInput())).Content.ReadFromJsonAsync<BookDto>();
        var reader = await (await client.PostAsJsonAsync("/api/readers", new ReaderInput("Ada Lovelace", "R-001", null, null, null, null))).Content.ReadFromJsonAsync<ReaderDto>();
        return (book!, reader!, client);
    }

    [Fact]
    public async Task CreateLoanPersistsAndMakesCopyUnavailable()
    {
        using var factory = new ApiFactory();
        var seeded = await SeedAsync(factory);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        var response = await seeded.Client.PostAsJsonAsync("/api/loans", new LoanInput(seeded.Reader.Id, seeded.Book.Copies[0].Id, today, today.AddDays(7)));
        var loan = await response.Content.ReadFromJsonAsync<LoanDto>();
        var book = await seeded.Client.GetFromJsonAsync<BookDto>($"/api/books/{seeded.Book.Id}");
        var duplicate = await seeded.Client.PostAsJsonAsync("/api/loans", new LoanInput(seeded.Reader.Id, seeded.Book.Copies[0].Id, today, today.AddDays(7)));

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        Assert.Equal("ACTIVE", loan!.Status);
        Assert.Equal(0, book!.AvailableCopies);
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
    }

    [Fact]
    public async Task CreateLoanRejectsSuspendedReaderAndInvalidDates()
    {
        using var factory = new ApiFactory();
        var seeded = await SeedAsync(factory);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        await seeded.Client.PatchAsJsonAsync($"/api/readers/{seeded.Reader.Id}/status", new ReaderStatusInput("SUSPENDED"));

        var blocked = await seeded.Client.PostAsJsonAsync("/api/loans", new LoanInput(seeded.Reader.Id, seeded.Book.Copies[0].Id, today, today.AddDays(7)));
        var invalid = await seeded.Client.PostAsJsonAsync("/api/loans", new LoanInput(seeded.Reader.Id, seeded.Book.Copies[0].Id, today.AddDays(1), today.AddDays(7)));

        Assert.Equal(HttpStatusCode.BadRequest, blocked.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
    }

    [Fact]
    public async Task ReturnPersistsHistoryAndRestoresAvailability()
    {
        using var factory = new ApiFactory();
        var seeded = await SeedAsync(factory);
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var created = await (await seeded.Client.PostAsJsonAsync("/api/loans", new LoanInput(seeded.Reader.Id, seeded.Book.Copies[0].Id, today, today.AddDays(7)))).Content.ReadFromJsonAsync<LoanDto>();

        var returnedResponse = await seeded.Client.PostAsJsonAsync($"/api/loans/{created!.Id}/return", new ReturnInput(today));
        var returned = await returnedResponse.Content.ReadFromJsonAsync<LoanDto>();
        var duplicate = await seeded.Client.PostAsJsonAsync($"/api/loans/{created.Id}/return", new ReturnInput(today));
        var history = await seeded.Client.GetFromJsonAsync<List<LoanDto>>("/api/loans?status=RETURNED");
        var book = await seeded.Client.GetFromJsonAsync<BookDto>($"/api/books/{seeded.Book.Id}");

        Assert.Equal(HttpStatusCode.OK, returnedResponse.StatusCode);
        Assert.Equal("RETURNED", returned!.Status);
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
        Assert.Contains(history!, loan => loan.Id == created.Id && loan.ReturnDate == today);
        Assert.Equal(1, book!.AvailableCopies);
    }
}
