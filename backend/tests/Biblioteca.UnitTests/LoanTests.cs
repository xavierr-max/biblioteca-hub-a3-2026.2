using Biblioteca.Domain;
using Biblioteca.Domain.Entities;
using Biblioteca.Domain.Enums;

namespace Biblioteca.UnitTests;

public sealed class LoanTests
{
    private static (Book Book, BookCopy Copy, Reader Reader) Fixtures()
    {
        var book = new Book("Clean Code", "Robert Martin", "9780306406157", "Técnico", "Prentice", 2008, 1);
        var reader = new Reader("Ada Lovelace", "R-001");
        return (book, book.Copies[0], reader);
    }

    [Fact]
    public void LoanMarksCopyAndReaderAsActive()
    {
        var fixture = Fixtures();
        var loan = new Loan(fixture.Book, fixture.Copy, fixture.Reader, DateOnly.FromDateTime(DateTime.UtcNow), DateOnly.FromDateTime(DateTime.UtcNow).AddDays(7));
        fixture.Copy.MarkAsLoaned();
        fixture.Reader.RegisterLoan();

        Assert.Equal(LoanStatus.Active, loan.Status);
        Assert.Equal(CopyStatus.Loaned, fixture.Copy.Status);
        Assert.Equal(1, fixture.Reader.ActiveLoansCount);
    }

    [Fact]
    public void InvalidLoanDatesAreRejected()
    {
        var fixture = Fixtures();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);

        Assert.Throws<DomainException>(() => new Loan(fixture.Book, fixture.Copy, fixture.Reader, today.AddDays(1), today.AddDays(2)));
        Assert.Throws<DomainException>(() => new Loan(fixture.Book, fixture.Copy, fixture.Reader, today, today));
    }

    [Fact]
    public void ReturnIsRegisteredOnlyOnceAndReleasesCopy()
    {
        var fixture = Fixtures();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var loan = new Loan(fixture.Book, fixture.Copy, fixture.Reader, today, today.AddDays(7));
        fixture.Copy.MarkAsLoaned();
        fixture.Reader.RegisterLoan();

        loan.RegisterReturn(today);
        fixture.Copy.ReleaseFromReturn();
        fixture.Reader.RegisterReturn();

        Assert.Equal(LoanStatus.Returned, loan.Status);
        Assert.Equal(CopyStatus.Available, fixture.Copy.Status);
        Assert.Equal(0, fixture.Reader.ActiveLoansCount);
        Assert.Throws<DomainException>(() => loan.RegisterReturn(today));
    }
}
