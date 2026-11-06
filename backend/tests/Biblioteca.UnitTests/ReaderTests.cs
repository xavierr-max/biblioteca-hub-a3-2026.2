using Biblioteca.Domain;
using Biblioteca.Domain.Entities;
using Biblioteca.Domain.Enums;

namespace Biblioteca.UnitTests;

public sealed class ReaderTests
{
    [Fact]
    public void CreatesRegularReaderWithTrimmedData()
    {
        var reader = new Reader(" Ana ", " MAT-1 ", "ana@example.com", "(11) 98765-4321");

        Assert.Equal("Ana", reader.Name);
        Assert.Equal("MAT-1", reader.Identifier);
        Assert.Equal(ReaderStatus.Regular, reader.Status);
    }

    [Theory]
    [InlineData("", "MAT-1")]
    [InlineData("Ana", "")]
    public void RejectsRequiredFields(string name, string identifier)
        => Assert.Throws<DomainException>(() => new Reader(name, identifier));

    [Theory]
    [InlineData("invalid")]
    [InlineData("123")]
    public void RejectsInvalidContacts(string value)
    {
        Assert.Throws<DomainException>(() => new Reader("Ana", "MAT-1", value, null));
        Assert.Throws<DomainException>(() => new Reader("Ana", "MAT-2", null, value));
    }

    [Fact]
    public void ChangesStatusWithoutChangingRegistrationData()
    {
        var reader = new Reader("Ana", "MAT-1");

        reader.SetStatus(ReaderStatus.Suspended);

        Assert.Equal(ReaderStatus.Suspended, reader.Status);
        Assert.Equal("Ana", reader.Name);
    }
}
