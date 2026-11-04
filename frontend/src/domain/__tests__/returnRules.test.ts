import { applyReturnOperation, resolveLoanCopy, validateReturnOperation } from '../returnRules';
import { BookCopy, Loan } from '../../types/library';

const copy: BookCopy = { id: 'copy-1', bookId: 'book-1', code: 'EX-001', status: 'LOANED', location: 'A-1' };
const loan: Loan = { id: 'loan-1', bookId: 'book-1', bookTitle: 'Clean Code', copyId: 'copy-1', copyCode: 'EX-001', readerId: 'reader-1', readerName: 'Ana', loanDate: '2026-11-01', dueDate: '2026-11-10', status: 'ACTIVE' };

describe('regras de devolução', () => {
  test('resolve exemplar vinculado e rejeita divergência', () => {
    expect(resolveLoanCopy(loan, [copy])).toMatchObject({ success: true, copy });
    expect(resolveLoanCopy({ ...loan, copyId: 'missing' }, [copy]).code).toBe('COPY_NOT_FOUND');
    expect(resolveLoanCopy({ ...loan, copyCode: 'EX-999' }, [copy]).code).toBe('COPY_MISMATCH');
  });

  test.each([
    ['inexistente', 'missing', '2026-11-05', 'LOAN_NOT_FOUND'],
    ['já devolvido', 'returned', '2026-11-05', 'LOAN_ALREADY_RETURNED'],
    ['data inválida', 'loan-1', '05/11/2026', 'INVALID_RETURN_DATE'],
    ['antes do empréstimo', 'loan-1', '2026-10-31', 'RETURN_BEFORE_LOAN'],
    ['futura', 'loan-1', '2026-11-11', 'RETURN_IN_FUTURE'],
  ])('valida data/operação %s', (_name: string, id: string, date: string, code: string) => {
    const loans = id === 'missing' ? [] : [id === 'loan-1' ? loan : { ...loan, id, status: 'RETURNED' as const, returnDate: '2026-11-04' }];
    expect(validateReturnOperation(id, date, loans, [copy], '2026-11-10').code).toBe(code);
  });

  test('aplica devolução e libera o exemplar', () => {
    const result = applyReturnOperation('loan-1', '2026-11-05', [loan], [copy], '2026-11-10');
    expect(result.success).toBe(true);
    expect(result.returnedLoan).toMatchObject({ status: 'RETURNED', returnDate: '2026-11-05' });
    expect(result.nextCopies).toEqual([{ ...copy, status: 'AVAILABLE' }]);
  });

  test('bloqueia devolução quando exemplar não está emprestado', () => {
    expect(validateReturnOperation('loan-1', '2026-11-05', [loan], [{ ...copy, status: 'AVAILABLE' }], '2026-11-10').code).toBe('COPY_NOT_LOANED');
  });
});
