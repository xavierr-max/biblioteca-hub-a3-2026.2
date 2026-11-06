using Biblioteca.Domain.Entities;
using Biblioteca.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace Biblioteca.Infrastructure.Persistence.Configurations;

public sealed class LoanConfiguration : IEntityTypeConfiguration<Loan>
{
    public void Configure(EntityTypeBuilder<Loan> builder)
    {
        builder.ToTable("Loans");
        builder.HasKey(loan => loan.Id);
        builder.Property(loan => loan.BookTitle).HasMaxLength(200).IsRequired();
        builder.Property(loan => loan.CopyCode).HasMaxLength(50).IsRequired();
        builder.Property(loan => loan.ReaderName).HasMaxLength(160).IsRequired();
        builder.Property(loan => loan.Status)
            .HasConversion(value => value.ToString().ToUpperInvariant(), value => Enum.Parse<LoanStatus>(value, true))
            .HasMaxLength(20)
            .IsRequired();
        builder.HasIndex(loan => loan.CopyId)
            .IsUnique()
            .HasFilter("\"Status\" <> 'RETURNED'");
        builder.HasIndex(loan => loan.ReaderId);
        builder.HasOne<Book>().WithMany().HasForeignKey(loan => loan.BookId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<BookCopy>().WithMany().HasForeignKey(loan => loan.CopyId).OnDelete(DeleteBehavior.Restrict);
        builder.HasOne<Reader>().WithMany().HasForeignKey(loan => loan.ReaderId).OnDelete(DeleteBehavior.Restrict);
    }
}
