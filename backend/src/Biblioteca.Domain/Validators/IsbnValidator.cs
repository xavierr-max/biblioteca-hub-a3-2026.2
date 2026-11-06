namespace Biblioteca.Domain;

public static class IsbnValidator
{
    public static string Clean(string value) => new(value.Where(character => !char.IsWhiteSpace(character) && character != '-').ToArray());

    public static bool IsValid(string value)
    {
        var isbn = Clean(value).ToUpperInvariant();
        return isbn.Length switch
        {
            10 => IsValidIsbn10(isbn),
            13 => IsValidIsbn13(isbn),
            _ => false
        };
    }

    private static bool IsValidIsbn10(string isbn)
    {
        var sum = 0;
        for (var index = 0; index < 9; index++)
        {
            if (!char.IsDigit(isbn[index])) return false;
            sum += (isbn[index] - '0') * (10 - index);
        }

        var checkDigit = isbn[9] == 'X' ? 10 : char.IsDigit(isbn[9]) ? isbn[9] - '0' : -1;
        return checkDigit >= 0 && (sum + checkDigit) % 11 == 0;
    }

    private static bool IsValidIsbn13(string isbn)
    {
        if (isbn.Any(character => !char.IsDigit(character))) return false;
        var sum = 0;
        for (var index = 0; index < 12; index++) sum += (isbn[index] - '0') * (index % 2 == 0 ? 1 : 3);
        return isbn[12] - '0' == (10 - sum % 10) % 10;
    }
}
