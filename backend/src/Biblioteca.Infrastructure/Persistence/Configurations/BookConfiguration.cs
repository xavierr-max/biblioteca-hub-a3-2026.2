using Biblioteca.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Biblioteca.Infrastructure.Persistence.Configurations;

public sealed class BookConfiguration : IEntityTypeConfiguration<Book>
{
    public void Configure(EntityTypeBuilder<Book> builder)
    {
        builder.HasKey(book => book.Id);
        builder.HasIndex(book => book.Isbn).IsUnique();
        builder.Property(book => book.Isbn).HasMaxLength(20).IsRequired();
        builder.HasMany(book => book.Copies).WithOne().HasForeignKey(copy => copy.BookId).OnDelete(DeleteBehavior.Cascade);
    }
}
