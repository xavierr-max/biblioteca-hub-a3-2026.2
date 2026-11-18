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
    [Fact] public void Suspension_has_clear_reason() => Assert.Equal("Reader is suspended.", LoanRules.Validate(Reader(true), Copy(), 0).Error);
    [Fact] public void Loan_limit_has_clear_reason() => Assert.Equal("Reader reached the active loan limit.", LoanRules.Validate(Reader(), Copy(), 3).Error);
    [Fact] public void Availability_is_checked_after_reader_limit() => Assert.Equal("Reader reached the active loan limit.", LoanRules.Validate(Reader(), Copy(CopyStatus.Maintenance), 3).Error);
    [Fact] public void Allowed_decision_has_no_error() { var decision = LoanRules.Validate(Reader(), Copy(), 0); Assert.True(decision.Allowed); Assert.Null(decision.Error); }
}
