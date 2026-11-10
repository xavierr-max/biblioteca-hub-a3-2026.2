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
    else if (provider.Equals("MySql", StringComparison.OrdinalIgnoreCase)) options.UseMySql(connection, ServerVersion.AutoDetect(connection));
    else options.UseSqlite(connection);
});
builder.Services.AddCors(options => options.AddPolicy("DevelopmentFrontend", policy =>
    policy.WithOrigins("http://localhost:5173", "http://127.0.0.1:5173")
        .AllowAnyHeader()
        .AllowAnyMethod()));
builder.Services.AddInfrastructure();
builder.Services.AddScoped<BookService>();
builder.Services.AddScoped<ReaderService>();
builder.Services.AddScoped<LoanService>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();
if (app.Environment.IsDevelopment()) app.UseCors("DevelopmentFrontend");
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BibliotecaDbContext>();
    if (provider.Equals("Postgres", StringComparison.OrdinalIgnoreCase)) await db.Database.MigrateAsync();
    else if (provider.Equals("MySql", StringComparison.OrdinalIgnoreCase)) await db.Database.EnsureCreatedAsync();
    else await db.Database.EnsureCreatedAsync();
}

app.UseSwagger();
app.UseSwaggerUI();
app.MapBookEndpoints();
app.MapReaderEndpoints();
app.MapLoanEndpoints();
app.Run();

public partial class Program { }
