using Biblioteca.Api.Extensions;
using Biblioteca.Application.Services;
using Biblioteca.Domain;
using Biblioteca.Infrastructure;
using Biblioteca.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
var provider = builder.Configuration["Database:Provider"] ?? "Sqlite";
var connection = builder.Configuration.GetConnectionString("Biblioteca") ?? "Data Source=biblioteca.dev.db";

builder.Services.AddDbContext<BibliotecaDbContext>(options =>
{
    if (provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase)) options.UseNpgsql(connection);
    else options.UseSqlite(connection);
});
builder.Services.AddInfrastructure();
builder.Services.AddScoped<BookService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BibliotecaDbContext>();
    if (provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase)) await db.Database.MigrateAsync();
    else await db.Database.EnsureCreatedAsync();
}

app.UseSwagger();
app.UseSwaggerUI();
app.MapBookEndpoints();
app.Run();

public partial class Program { }
