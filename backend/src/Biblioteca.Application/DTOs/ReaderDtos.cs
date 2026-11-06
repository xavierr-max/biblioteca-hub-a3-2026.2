namespace Biblioteca.Application.DTOs;

public sealed record ReaderInput(string Name, string Identifier, string? Email, string? Phone, string? Course, string? Notes);

public sealed record ReaderStatusInput(string Status);

public sealed record ReaderDto(Guid Id, string Name, string Identifier, string? Email, string? Phone, string? Course, string? Notes, DateOnly RegistrationDate, string Status, int ActiveLoansCount);
