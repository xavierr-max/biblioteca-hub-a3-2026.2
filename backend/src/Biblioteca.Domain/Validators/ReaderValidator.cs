namespace Biblioteca.Domain;

public static class ReaderValidator
{
    public static bool IsValidEmail(string? email)
    {
        if (string.IsNullOrWhiteSpace(email)) return true;
        return System.Text.RegularExpressions.Regex.IsMatch(email.Trim(), @"^[^\s@]+@[^\s@]+\.[^\s@]+$");
    }

    public static bool IsValidPhone(string? phone)
    {
        if (string.IsNullOrWhiteSpace(phone)) return true;
        var digits = new string(phone.Where(char.IsDigit).ToArray());
        return digits.Length is >= 8 and <= 13;
    }
}
