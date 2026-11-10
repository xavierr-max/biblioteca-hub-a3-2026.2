using System.Net;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Biblioteca.Tests;

public sealed class ApiHealthIntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient client;

    public ApiHealthIntegrationTests(WebApplicationFactory<Program> factory)
    {
        client = factory.CreateClient();
    }

    [Fact]
    public async Task Health_endpoint_returns_ok()
    {
        var response = await client.GetAsync("/api/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Contains("\"status\":\"ok\"", await response.Content.ReadAsStringAsync());
    }
}
