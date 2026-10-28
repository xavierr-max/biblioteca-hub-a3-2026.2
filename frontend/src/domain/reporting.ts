import { Loan } from '../types/library';

export type DerivedLoanStatus = 'ACTIVE' | 'OVERDUE' | 'RETURNED';
export type MovementType = 'LOAN' | 'RETURN';

export interface MovementEvent {
  id: string;
  type: MovementType;
  loanId: string;
  bookId: string;
  bookTitle: string;
  readerId: string;
  readerName: string;
  copyId?: string;
  copyCode: string;
  date: string;
  details: string;
}

const parseDate = (value: string) => new Date(`${value}T12:00:00`);

export function getDerivedLoanStatus(
  loan: Loan,
  today = new Date()
): DerivedLoanStatus {
  if (loan.status === 'RETURNED' || loan.returnDate) return 'RETURNED';
  const startOfToday = new Date(today);
  startOfToday.setHours(0, 0, 0, 0);
  return parseDate(loan.dueDate) < startOfToday ? 'OVERDUE' : 'ACTIVE';
}

export function wasLoanReturnedLate(loan: Loan): boolean {
  return Boolean(
    loan.returnDate &&
      parseDate(loan.returnDate).getTime() > parseDate(loan.dueDate).getTime()
  );
}

export function buildMovementHistory(loans: Loan[]): MovementEvent[] {
  return loans
    .flatMap((loan) => {
      const events: MovementEvent[] = [
        {
          id: `loan-${loan.id}`,
          type: 'LOAN',
          loanId: loan.id,
          bookId: loan.bookId,
          bookTitle: loan.bookTitle,
          readerId: loan.readerId,
          readerName: loan.readerName,
          copyId: loan.copyId,
          copyCode: loan.copyCode,
          date: loan.loanDate,
          details: `Empréstimo registrado com devolução prevista para ${loan.dueDate}.`,
        },
      ];
      if (loan.returnDate) {
        events.push({
          id: `return-${loan.id}`,
          type: 'RETURN',
          loanId: loan.id,
          bookId: loan.bookId,
          bookTitle: loan.bookTitle,
          readerId: loan.readerId,
          readerName: loan.readerName,
          copyId: loan.copyId,
          copyCode: loan.copyCode,
          date: loan.returnDate,
          details: wasLoanReturnedLate(loan)
            ? 'Devolução registrada após o prazo previsto.'
            : 'Devolução registrada dentro do prazo previsto.',
        });
      }
      return events;
    })
    .sort(
      (first, second) =>
        parseDate(second.date).getTime() - parseDate(first.date).getTime()
    );
}

export function escapeCsvCell(value: unknown): string {
  const text =
    value === null || value === undefined ? 'Não disponível' : String(value);
  return `"${text.replace(/"/g, '""')}"`;
}

export function createCsv(
  headers: string[],
  rows: Array<Array<unknown>>
): string {
  const lines = [
    headers.map(escapeCsvCell).join(';'),
    ...rows.map((row) => row.map(escapeCsvCell).join(';')),
  ];
  return `\uFEFF${lines.join('\r\n')}`;
}

export function isDateInPeriod(
  dateValue: string | undefined,
  period: 'ALL' | 'LAST_30' | 'CURRENT_MONTH' | 'CURRENT_YEAR',
  now = new Date()
): boolean {
  if (!dateValue) return false;
  if (period === 'ALL') return true;
  const date = parseDate(dateValue);
  if (period === 'LAST_30') {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - 30);
    return date >= start && date <= now;
  }
  if (period === 'CURRENT_MONTH') {
    return (
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear()
    );
  }
  return date.getFullYear() === now.getFullYear();
}
