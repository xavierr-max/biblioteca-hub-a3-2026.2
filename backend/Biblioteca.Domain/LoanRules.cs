namespace Biblioteca.Domain;

public sealed record LoanDecision(bool Allowed, string? Error)
{
    public static LoanDecision Permit() => new(true, null);
    public static LoanDecision Reject(string reason) => new(false, reason);
}

public static class LoanRules
{
    public static LoanDecision Validate(Reader reader, Copy copy, int activeLoans)
    {
        if (reader.IsSuspended) return LoanDecision.Reject("Reader is suspended.");
        if (activeLoans >= 3) return LoanDecision.Reject("Reader reached the active loan limit.");
        if (copy.Status != CopyStatus.Available) return LoanDecision.Reject("Copy is not available.");
        return LoanDecision.Permit();
    }
}
