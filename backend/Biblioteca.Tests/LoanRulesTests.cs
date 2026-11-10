using Biblioteca.Domain;

namespace Biblioteca.Tests;

public class LoanRulesTests
{
    private static Reader Reader(bool suspended = false) => new() { FullName = "Test Reader", RegistrationNumber = "T-001", IsSuspended = suspended };
    private static Copy Copy(CopyStatus status = CopyStatus.Available) => new() { BookId = 1, InventoryCode = "C-001", Status = status };

    [Fact] public void Suspended_reader_is_rejected() => Assert.False(LoanRules.Validate(Reader(true), Copy(), 0).Allowed);
    [Fact] public void Fourth_active_loan_is_rejected() => Assert.False(LoanRules.Validate(Reader(), Copy(), 3).Allowed);
    [Fact] public void Unavailable_copy_is_rejected() => Assert.False(LoanRules.Validate(Reader(), Copy(CopyStatus.Loaned), 0).Allowed);
    [Fact] public void Valid_loan_is_allowed() => Assert.True(LoanRules.Validate(Reader(), Copy(), 2).Allowed);
}
