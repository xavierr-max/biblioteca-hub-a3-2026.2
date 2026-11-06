using Biblioteca.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Biblioteca.Infrastructure.Persistence.Configurations;

public sealed class BookCopyConfiguration : IEntityTypeConfiguration<BookCopy>
{
    public void Configure(EntityTypeBuilder<BookCopy> builder)
    {
        builder.HasKey(copy => copy.Id);
        builder.HasIndex(copy => new { copy.BookId, copy.Code }).IsUnique();
        builder.Property(copy => copy.Status).HasConversion<string>();
    }
}
