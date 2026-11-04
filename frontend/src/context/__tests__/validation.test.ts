import { cleanISBN, isValidEmail, isValidPhone, validateISBN } from '../LibraryContext';

describe('validações da biblioteca', () => {
  test('valida e normaliza ISBN-10 e ISBN-13', () => {
    expect(validateISBN('0-306-40615-2')).toBe(true);
    expect(validateISBN('978-0-306-40615-7')).toBe(true);
    expect(validateISBN('978-0-306-40615-8')).toBe(false);
    expect(cleanISBN('978-0 306-40615-7')).toBe('9780306406157');
  });

  test('aceita campos de contato vazios e rejeita formatos inválidos', () => {
    expect(isValidEmail('')).toBe(true);
    expect(isValidEmail('reader@example.com')).toBe(true);
    expect(isValidEmail('reader@')).toBe(false);
    expect(isValidPhone('')).toBe(true);
    expect(isValidPhone('(11) 98765-4321')).toBe(true);
    expect(isValidPhone('123')).toBe(false);
  });
});
