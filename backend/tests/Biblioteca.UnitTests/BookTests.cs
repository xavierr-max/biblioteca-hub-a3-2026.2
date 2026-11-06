using Biblioteca.Domain;
using Biblioteca.Domain.Entities;
using Biblioteca.Domain.Enums;
namespace Biblioteca.UnitTests;
public class BookTests
{
    [Fact] public void CadastroValidoCriaCopias() { var b = new Book("Clean Code", "Robert Martin", "9780306406157", "Técnico", "Prentice", 2008, 2); Assert.Equal(2, b.Copies.Count); }
    [Theory][InlineData("")][InlineData("9780306406158")] public void DadosInvalidosRejeitados(string isbn) { Assert.Throws<DomainException>(() => new Book("Título", "Autor", isbn, "Geral", "Editora", 2020, 1)); }
    [Fact] public void ISBNPodeSerNormalizado() { Assert.Equal("9780306406157", IsbnValidator.Clean("978-0-306-40615-7")); }
    [Fact] public void ReducaoAbaixoDeEmprestadosERejeitada() { var b = new Book("T", "A", "9780306406157", "G", "E", 2020, 1); b.Copies[0].ChangeStatus(CopyStatus.Loaned); Assert.Throws<DomainException>(() => b.Update("T", "A", "9780306406157", "G", "E", 2020, 0, null)); }
    [Fact] public void ExemplarEmprestadoNaoPodeSerLiberadoManualmente() { var b = new Book("T", "A", "9780306406157", "G", "E", 2020, 1); b.Copies[0].ChangeStatus(CopyStatus.Loaned); Assert.Throws<DomainException>(() => b.Copies[0].ChangeStatus(CopyStatus.Available)); }
}
