using System.Net;
using System.Net.Http.Json;
using Biblioteca.Application.DTOs;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Biblioteca.IntegrationTests;

public sealed class ApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        connection.Open();
        builder.ConfigureServices(services =>
        {
            var descriptor = services.Single(service => service.ServiceType == typeof(DbContextOptions<BibliotecaDbContext>));
            services.Remove(descriptor);
            services.AddDbContext<BibliotecaDbContext>(options => options.UseSqlite(connection));
        });
    }

    protected override void Dispose(bool disposing)
    {
        connection.Dispose();
        base.Dispose(disposing);
    }
}

public sealed class BooksApiIntegrationTests
{
    private static BookInput ValidBook(string isbn = "9780306406157", int totalCopies = 2) =>
        new("Clean Code", "Robert Martin", isbn, "Técnico", "Prentice", 2008, totalCopies, null);

    [Fact]
    public async Task GetBooks_ReturnsEmptyListInitially()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var response = await client.GetAsync("/api/books");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var books = await response.Content.ReadFromJsonAsync<List<BookDto>>();
        Assert.NotNull(books);
        Assert.Empty(books!);
    }

    [Fact]
    public async Task PostThenGetBooks_PersistsBookAndCopies()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var createResponse = await client.PostAsJsonAsync("/api/books", ValidBook());
        var created = await createResponse.Content.ReadFromJsonAsync<BookDto>();
        var list = await client.GetFromJsonAsync<List<BookDto>>("/api/books");

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        Assert.NotNull(created);
        Assert.Contains(list!, book => book.Id == created!.Id && book.TotalCopies == 2);
        Assert.Equal(2, created!.Copies.Count);
    }

    [Fact]
    public async Task GetBook_ReturnsBookOrNotFound()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var createResponse = await client.PostAsJsonAsync("/api/books", ValidBook());
        var created = await createResponse.Content.ReadFromJsonAsync<BookDto>();

        var existing = await client.GetAsync($"/api/books/{created!.Id}");
        var missing = await client.GetAsync($"/api/books/{Guid.NewGuid()}");

        Assert.Equal(HttpStatusCode.OK, existing.StatusCode);
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [Fact]
    public async Task PostBook_RejectsInvalidAndDuplicateIsbn()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var invalid = await client.PostAsJsonAsync("/api/books", ValidBook("invalid"));
        var first = await client.PostAsJsonAsync("/api/books", ValidBook());
        var duplicate = await client.PostAsJsonAsync("/api/books", ValidBook());

        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
    }

    [Fact]
    public async Task PutBook_UpdatesBookAndRejectsNegativeCopies()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var createResponse = await client.PostAsJsonAsync("/api/books", ValidBook());
        var created = await createResponse.Content.ReadFromJsonAsync<BookDto>();

        var updated = await client.PutAsJsonAsync($"/api/books/{created!.Id}", ValidBook() with { Title = "Updated title" });
        var invalid = await client.PutAsJsonAsync($"/api/books/{created.Id}", ValidBook() with { TotalCopies = -1 });
        var persisted = await client.GetFromJsonAsync<BookDto>($"/api/books/{created.Id}");

        Assert.Equal(HttpStatusCode.OK, updated.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
        Assert.Equal("Updated title", persisted!.Title);
        Assert.Equal(2, persisted.TotalCopies);
    }

    [Fact]
    public async Task ArchiveBook_ReturnsNoContentAndNotFoundForMissingBook()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var createResponse = await client.PostAsJsonAsync("/api/books", ValidBook());
        var created = await createResponse.Content.ReadFromJsonAsync<BookDto>();

        var archive = await client.PostAsync($"/api/books/{created!.Id}/archive", null);
        var persisted = await client.GetFromJsonAsync<BookDto>($"/api/books/{created.Id}");
        var missing = await client.PostAsync($"/api/books/{Guid.NewGuid()}/archive", null);

        Assert.Equal(HttpStatusCode.NoContent, archive.StatusCode);
        Assert.True(persisted!.IsArchived);
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }
}
