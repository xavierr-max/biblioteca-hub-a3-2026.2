import { buildMovementHistory, createCsv, escapeCsvCell, getDerivedLoanStatus, isDateInPeriod, wasLoanReturnedLate } from '../reporting';
import { Loan } from '../../types/library';

const loan: Loan = { id: 'l1', bookId: 'b1', bookTitle: 'Livro', copyCode: 'EX-001', readerId: 'r1', readerName: 'Leitor', loanDate: '2026-11-01', dueDate: '2026-11-05', status: 'ACTIVE' };

describe('relatórios', () => {
  test('deriva status ativo, atrasado e devolvido', () => {
    expect(getDerivedLoanStatus(loan, new Date('2026-11-04T12:00:00'))).toBe('ACTIVE');
    expect(getDerivedLoanStatus(loan, new Date('2026-11-06T12:00:00'))).toBe('OVERDUE');
    expect(getDerivedLoanStatus({ ...loan, status: 'RETURNED', returnDate: '2026-11-04' }, new Date('2026-11-06T12:00:00'))).toBe('RETURNED');
  });

  test('identifica devolução atrasada e ordena movimentos', () => {
    const returned = { ...loan, status: 'RETURNED' as const, returnDate: '2026-11-06' };
    expect(wasLoanReturnedLate(returned)).toBe(true);
    expect(buildMovementHistory([loan, returned]).map((event) => event.id)).toEqual(['return-l1', 'loan-l1', 'loan-l1']);
  });

  test('escapa CSV e filtra períodos', () => {
    expect(escapeCsvCell('a"b')).toBe('"a""b"');
    expect(createCsv(['A'], [['x']])).toBe('\uFEFF"A"\r\n"x"');
    const now = new Date('2026-11-20T12:00:00');
    expect(isDateInPeriod('2026-11-10', 'CURRENT_MONTH', now)).toBe(true);
    expect(isDateInPeriod('2025-11-10', 'CURRENT_YEAR', now)).toBe(false);
    expect(isDateInPeriod(undefined, 'ALL', now)).toBe(false);
  });
});
