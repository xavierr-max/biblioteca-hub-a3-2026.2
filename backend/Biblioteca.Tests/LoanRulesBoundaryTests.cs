using Biblioteca.Domain;

namespace Biblioteca.Tests;

public class LoanRulesBoundaryTests
{
    private static Reader Reader() => new() { FullName = "Reader", RegistrationNumber = "R-1" };
    private static Copy Copy() => new() { BookId = 1, InventoryCode = "C-1" };

    [Fact] public void Two_active_loans_are_allowed() => Assert.True(LoanRules.Validate(Reader(), Copy(), 2).Allowed);
    [Fact] public void Three_active_loans_are_rejected_at_boundary() => Assert.False(LoanRules.Validate(Reader(), Copy(), 3).Allowed);
    [Fact] public void Maintenance_copy_is_rejected() => Assert.False(LoanRules.Validate(Reader(), new Copy { BookId = 1, InventoryCode = "C-1", Status = CopyStatus.Maintenance }, 0).Allowed);
    [Fact] public void Lost_copy_is_rejected() => Assert.False(LoanRules.Validate(Reader(), new Copy { BookId = 1, InventoryCode = "C-1", Status = CopyStatus.Lost }, 0).Allowed);
}
