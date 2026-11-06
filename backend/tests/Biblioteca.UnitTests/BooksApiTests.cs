using System.Net;
using System.Net.Http.Json;
using Biblioteca.Application.DTOs;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
namespace Biblioteca.UnitTests;
public sealed class BooksApiFactory : WebApplicationFactory<Program>
{
    private readonly SqliteConnection connection = new("Data Source=:memory:");
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        connection.Open();
        builder.ConfigureServices(services => { var descriptor = services.Single(d => d.ServiceType == typeof(DbContextOptions<BibliotecaDbContext>)); services.Remove(descriptor); services.AddDbContext<BibliotecaDbContext>(o => o.UseSqlite(connection)); });
    }
    protected override void Dispose(bool disposing) { connection.Dispose(); base.Dispose(disposing); }
}
public class BooksApiTests : IClassFixture<BooksApiFactory>
{
    private readonly HttpClient client; public BooksApiTests(BooksApiFactory factory) => client = factory.CreateClient();
    static BookInput Valid(string isbn = "9780306406157", int copies = 2) => new("Clean Code", "Robert Martin", isbn, "Técnico", "Prentice", 2008, copies, null);
    [Fact] public async Task CadastraEConsultaLivroComPersistenciaReal() { var post = await client.PostAsJsonAsync("/api/books", Valid("9780306406157")); Assert.Equal(HttpStatusCode.Created, post.StatusCode); var book = await post.Content.ReadFromJsonAsync<BookDto>(); var get = await client.GetFromJsonAsync<BookDto>($"/api/books/{book!.Id}"); Assert.Equal(2, get!.AvailableCopies); Assert.Equal(2, get.Copies.Count()); }
    [Fact] public async Task RejeitaIsbnInvalidoEDuplicado() { Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/books", Valid("invalid"))).StatusCode); var first = await client.PostAsJsonAsync("/api/books", Valid("9780061120084")); Assert.Equal(HttpStatusCode.Created, first.StatusCode); Assert.Equal(HttpStatusCode.BadRequest, (await client.PostAsJsonAsync("/api/books", Valid("9780061120084"))).StatusCode); }
    [Fact] public async Task ListaEPesquisaLivros() { var response = await client.GetFromJsonAsync<List<BookDto>>("/api/books?search=Clean"); Assert.NotNull(response); Assert.Contains(response!, x => x.Title == "Clean Code"); }
    [Fact] public async Task AtualizaEArquivaLivro() { var post = await client.PostAsJsonAsync("/api/books", Valid("9780439023481", 1)); var book = await post.Content.ReadFromJsonAsync<BookDto>(); var put = await client.PutAsJsonAsync($"/api/books/{book!.Id}", Valid("9780439023481", 1) with { Title = "Clean Code Updated" }); Assert.Equal(HttpStatusCode.OK, put.StatusCode); Assert.Equal(HttpStatusCode.NoContent, (await client.PostAsync($"/api/books/{book.Id}/archive", null)).StatusCode); var current = await client.GetFromJsonAsync<BookDto>($"/api/books/{book.Id}"); Assert.True(current!.IsArchived); }
}
