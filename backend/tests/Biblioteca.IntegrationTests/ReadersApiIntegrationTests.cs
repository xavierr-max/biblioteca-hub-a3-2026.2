using System.Net;
using System.Net.Http.Json;
using Biblioteca.Application.DTOs;

namespace Biblioteca.IntegrationTests;

public sealed class ReadersApiIntegrationTests
{
    private static ReaderInput ValidReader(string identifier = "MAT-001") =>
        new("Ana Leitura", identifier, "ana@example.com", "11987654321", "Biblioteconomia", null);

    [Fact]
    public async Task ReadersEndpoints_CreateListAndGetReader()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var create = await client.PostAsJsonAsync("/api/readers", ValidReader());
        var reader = await create.Content.ReadFromJsonAsync<ReaderDto>();
        var list = await client.GetFromJsonAsync<List<ReaderDto>>("/api/readers");
        var get = await client.GetAsync($"/api/readers/{reader!.Id}");

        Assert.Equal(HttpStatusCode.Created, create.StatusCode);
        Assert.Equal(HttpStatusCode.OK, get.StatusCode);
        Assert.Contains(list!, item => item.Id == reader.Id && item.Status == "REGULAR");
    }

    [Fact]
    public async Task ReadersEndpoints_RejectInvalidAndDuplicateData()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateClient();

        var invalidName = await client.PostAsJsonAsync("/api/readers", ValidReader() with { Name = "" });
        var invalidEmail = await client.PostAsJsonAsync("/api/readers", ValidReader("MAT-002") with { Email = "invalid" });
        var invalidPhone = await client.PostAsJsonAsync("/api/readers", ValidReader("MAT-003") with { Phone = "123" });
        var first = await client.PostAsJsonAsync("/api/readers", ValidReader());
        var duplicate = await client.PostAsJsonAsync("/api/readers", ValidReader("mat-001"));

        Assert.Equal(HttpStatusCode.BadRequest, invalidName.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidEmail.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, invalidPhone.StatusCode);
        Assert.Equal(HttpStatusCode.Created, first.StatusCode);
        Assert.Equal(HttpStatusCode.BadRequest, duplicate.StatusCode);
    }

    [Fact]
    public async Task ReadersEndpoints_UpdateAndPersistReader()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var create = await client.PostAsJsonAsync("/api/readers", ValidReader());
        var reader = await create.Content.ReadFromJsonAsync<ReaderDto>();

        var update = await client.PutAsJsonAsync($"/api/readers/{reader!.Id}", ValidReader() with { Name = "Ana Atualizada", Identifier = "MAT-UPDATED" });
        var persisted = await client.GetFromJsonAsync<ReaderDto>($"/api/readers/{reader.Id}");
        var missing = await client.PutAsJsonAsync($"/api/readers/{Guid.NewGuid()}", ValidReader());

        Assert.Equal(HttpStatusCode.OK, update.StatusCode);
        Assert.Equal("Ana Atualizada", persisted!.Name);
        Assert.Equal("MAT-UPDATED", persisted.Identifier);
        Assert.Equal(HttpStatusCode.NotFound, missing.StatusCode);
    }

    [Fact]
    public async Task ReadersEndpoints_DeactivatesAndReactivatesReader()
    {
        using var factory = new ApiFactory();
        using var client = factory.CreateClient();
        var create = await client.PostAsJsonAsync("/api/readers", ValidReader());
        var reader = await create.Content.ReadFromJsonAsync<ReaderDto>();

        var suspended = await client.PatchAsJsonAsync($"/api/readers/{reader!.Id}/status", new ReaderStatusInput("SUSPENDED"));
        var regular = await client.PatchAsJsonAsync($"/api/readers/{reader.Id}/status", new ReaderStatusInput("REGULAR"));
        var invalid = await client.PatchAsJsonAsync($"/api/readers/{reader.Id}/status", new ReaderStatusInput("UNKNOWN"));

        Assert.Equal("SUSPENDED", (await suspended.Content.ReadFromJsonAsync<ReaderDto>())!.Status);
        Assert.Equal("REGULAR", (await regular.Content.ReadFromJsonAsync<ReaderDto>())!.Status);
        Assert.Equal(HttpStatusCode.BadRequest, invalid.StatusCode);
    }
}
