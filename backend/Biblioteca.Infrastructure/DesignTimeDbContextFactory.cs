using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace Biblioteca.Infrastructure;

public sealed class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<LibraryDbContext>
{
    public LibraryDbContext CreateDbContext(string[] args)
    {
        var builder = new DbContextOptionsBuilder<LibraryDbContext>();
        builder.UseMySQL("Server=localhost;Port=3306;Database=biblioteca;User=biblioteca_app;Password=change_me_local_only;");
        return new LibraryDbContext(builder.Options);
    }
}
