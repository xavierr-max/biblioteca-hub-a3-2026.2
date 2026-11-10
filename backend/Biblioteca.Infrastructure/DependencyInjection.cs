using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace Biblioteca.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connection = configuration.GetConnectionString("Biblioteca") ?? Environment.GetEnvironmentVariable("BIBLIOTECA_CONNECTION");
        if (string.IsNullOrWhiteSpace(connection)) connection = "Server=localhost;Port=3306;Database=biblioteca;User=biblioteca_app;Password=change_me_local_only;";
        services.AddDbContext<LibraryDbContext>(options => options.UseMySQL(connection));
        return services;
    }
}
