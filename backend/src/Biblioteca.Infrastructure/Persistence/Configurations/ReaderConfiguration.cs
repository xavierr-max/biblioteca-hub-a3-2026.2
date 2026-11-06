using Biblioteca.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Biblioteca.Infrastructure.Persistence.Configurations;

public sealed class ReaderConfiguration : IEntityTypeConfiguration<Reader>
{
    public void Configure(EntityTypeBuilder<Reader> builder)
    {
        builder.HasKey(reader => reader.Id);
        builder.HasIndex(reader => reader.Identifier).IsUnique();
        builder.Property(reader => reader.Identifier).HasMaxLength(100).IsRequired();
        builder.Property(reader => reader.Status).HasConversion<string>().IsRequired();
    }
}
