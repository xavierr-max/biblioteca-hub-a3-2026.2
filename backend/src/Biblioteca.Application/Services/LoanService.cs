using Biblioteca.Application.DTOs;
using Biblioteca.Application.Interfaces;
using Biblioteca.Domain;
using Biblioteca.Domain.Entities;
using Biblioteca.Domain.Enums;

namespace Biblioteca.Application.Services;

public sealed class LoanService(ILoanRepository repository)
{
    public Task<IReadOnlyList<LoanDto>> ListAsync(string? status, CancellationToken cancellationToken = default)
    {
        cancellationToken.ThrowIfCancellationRequested();
        var today = DateOnly.FromDateTime(DateTime.UtcNow);
        var loans = repository.Query().ToList();
        var mapped = loans.Select(loan => Map(loan, today));
        if (!string.IsNullOrWhiteSpace(status))
            mapped = mapped.Where(loan => loan.Status.Equals(status, StringComparison.OrdinalIgnoreCase));

        return Task.FromResult<IReadOnlyList<LoanDto>>(mapped.ToList());
    }

    public async Task<LoanDto?> GetAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var loan = await repository.FindAsync(id, cancellationToken);
        return loan is null ? null : Map(loan, DateOnly.FromDateTime(DateTime.UtcNow));
    }

    public async Task<LoanDto> CreateAsync(LoanInput input, CancellationToken cancellationToken = default)
    {
        return await repository.InTransactionAsync(async () =>
        {
            var reader = await repository.FindReaderAsync(input.ReaderId, cancellationToken)
                ?? throw new DomainException("O leitor informado não existe.");
            if (reader.Status != ReaderStatus.Regular)
                throw new DomainException("O leitor selecionado está inativo ou suspenso e não pode realizar empréstimos.");

            var copy = await repository.FindCopyAsync(input.CopyId, cancellationToken)
                ?? throw new DomainException("O exemplar selecionado não existe.");
            if (copy.Status != CopyStatus.Available)
                throw new DomainException($"O exemplar {copy.Code} não está mais disponível para empréstimo.");

            var book = await repository.FindBookAsync(copy.BookId, cancellationToken)
                ?? throw new DomainException("O livro vinculado ao exemplar não existe.");
            if (book.IsArchived)
                throw new DomainException("O título selecionado está arquivado e não permite novos empréstimos.");

            copy.MarkAsLoaned();
            reader.RegisterLoan();
            var loan = new Loan(book, copy, reader, input.LoanDate, input.DueDate);
            repository.Add(loan);
            await repository.SaveAsync(cancellationToken);
            return Map(loan, DateOnly.FromDateTime(DateTime.UtcNow));
        }, cancellationToken);
    }

    public async Task<LoanDto?> ReturnAsync(Guid id, ReturnInput input, CancellationToken cancellationToken = default)
    {
        return await repository.InTransactionAsync(async () =>
        {
            var loan = await repository.FindAsync(id, cancellationToken);
            if (loan is null) return null;
            var copy = await repository.FindCopyAsync(loan.CopyId, cancellationToken)
                ?? throw new DomainException("O exemplar vinculado ao empréstimo não foi encontrado.");
            var reader = await repository.FindReaderAsync(loan.ReaderId, cancellationToken)
                ?? throw new DomainException("O leitor vinculado ao empréstimo não foi encontrado.");

            loan.RegisterReturn(input.ReturnDate);
            copy.ReleaseFromReturn();
            reader.RegisterReturn();
            await repository.SaveAsync(cancellationToken);
            return Map(loan, DateOnly.FromDateTime(DateTime.UtcNow));
        }, cancellationToken);
    }

    private static LoanDto Map(Loan loan, DateOnly today)
    {
        var status = loan.Status == LoanStatus.Returned
            ? "RETURNED"
            : loan.DueDate < today ? "OVERDUE" : "ACTIVE";
        return new LoanDto(loan.Id, loan.BookId, loan.BookTitle, loan.CopyId, loan.CopyCode,
            loan.ReaderId, loan.ReaderName, loan.LoanDate, loan.DueDate, loan.ReturnDate, status);
    }
}
