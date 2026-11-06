namespace Biblioteca.Domain;

public sealed class DomainException(string message) : Exception(message);
