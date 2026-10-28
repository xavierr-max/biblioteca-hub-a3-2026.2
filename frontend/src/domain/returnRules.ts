import { BookCopy, Loan } from '../types/library';

export type ReturnValidationCode =
  | 'LOAN_NOT_FOUND'
  | 'LOAN_ALREADY_RETURNED'
  | 'INVALID_RETURN_DATE'
  | 'RETURN_BEFORE_LOAN'
  | 'RETURN_IN_FUTURE'
  | 'COPY_NOT_FOUND'
  | 'AMBIGUOUS_LEGACY_COPY'
  | 'COPY_MISMATCH'
  | 'COPY_NOT_LOANED';

export interface ReturnValidationResult {
  success: boolean;
  code?: ReturnValidationCode;
  error?: string;
  loan?: Loan;
  copy?: BookCopy;
}

export interface ReturnMutationResult extends ReturnValidationResult {
  returnedLoan?: Loan;
  nextLoans?: Loan[];
  nextCopies?: BookCopy[];
}

const parseDate = (value: string) => new Date(`${value}T12:00:00`);

export function resolveLoanCopy(
  loan: Loan,
  copies: BookCopy[]
): ReturnValidationResult {
  if (loan.copyId) {
    const copy = copies.find((item) => item.id === loan.copyId);
    if (!copy) {
      return {
        success: false,
        code: 'COPY_NOT_FOUND',
        error: `O exemplar interno ${loan.copyId} vinculado ao empréstimo não foi encontrado.`,
      };
    }
    if (copy.bookId !== loan.bookId || copy.code !== loan.copyCode) {
      return {
        success: false,
        code: 'COPY_MISMATCH',
        error:
          'O exemplar encontrado não corresponde ao livro e ao código registrados no empréstimo.',
      };
    }
    return { success: true, loan, copy };
  }

  const candidates = copies.filter(
    (copy) => copy.bookId === loan.bookId && copy.code === loan.copyCode
  );
  if (candidates.length === 0) {
    return {
      success: false,
      code: 'COPY_NOT_FOUND',
      error: `Não foi encontrado um exemplar correspondente a ${loan.copyCode} para este empréstimo legado.`,
    };
  }
  if (candidates.length > 1) {
    return {
      success: false,
      code: 'AMBIGUOUS_LEGACY_COPY',
      error:
        'Este empréstimo legado não possui copyId e há mais de um exemplar compatível. A devolução foi bloqueada para evitar liberar o exemplar incorreto.',
    };
  }
  return { success: true, loan, copy: candidates[0] };
}

export function validateReturnOperation(
  loanId: string,
  returnDate: string,
  loans: Loan[],
  copies: BookCopy[],
  today: string
): ReturnValidationResult {
  const loan = loans.find((item) => item.id === loanId);
  if (!loan) {
    return {
      success: false,
      code: 'LOAN_NOT_FOUND',
      error: 'O empréstimo informado não existe.',
    };
  }
  if (loan.status === 'RETURNED' || loan.returnDate) {
    return {
      success: false,
      code: 'LOAN_ALREADY_RETURNED',
      error: 'Este empréstimo já possui uma devolução registrada.',
    };
  }

  const parsedReturnDate = parseDate(returnDate);
  const parsedLoanDate = parseDate(loan.loanDate);
  const parsedToday = parseDate(today);
  if (
    !returnDate ||
    Number.isNaN(parsedReturnDate.getTime()) ||
    !/^\d{4}-\d{2}-\d{2}$/.test(returnDate)
  ) {
    return {
      success: false,
      code: 'INVALID_RETURN_DATE',
      error: 'Informe uma data efetiva de devolução válida.',
    };
  }
  if (parsedReturnDate < parsedLoanDate) {
    return {
      success: false,
      code: 'RETURN_BEFORE_LOAN',
      error: 'A data de devolução não pode ser anterior à data do empréstimo.',
    };
  }
  if (parsedReturnDate > parsedToday) {
    return {
      success: false,
      code: 'RETURN_IN_FUTURE',
      error: 'A data de devolução não pode estar no futuro.',
    };
  }

  const resolution = resolveLoanCopy(loan, copies);
  if (!resolution.success || !resolution.copy) return resolution;
  if (resolution.copy.status !== 'LOANED') {
    return {
      success: false,
      code: 'COPY_NOT_LOANED',
      error: `O exemplar ${resolution.copy.code} não está marcado como emprestado. A operação foi bloqueada para evitar inconsistência na disponibilidade.`,
    };
  }

  return { success: true, loan, copy: resolution.copy };
}

export function applyReturnOperation(
  loanId: string,
  returnDate: string,
  loans: Loan[],
  copies: BookCopy[],
  today: string
): ReturnMutationResult {
  const validation = validateReturnOperation(
    loanId,
    returnDate,
    loans,
    copies,
    today
  );
  if (!validation.success || !validation.loan || !validation.copy) {
    return validation;
  }

  const returnedLoan: Loan = {
    ...validation.loan,
    copyId: validation.copy.id,
    returnDate,
    status: 'RETURNED',
  };
  return {
    success: true,
    loan: validation.loan,
    copy: validation.copy,
    returnedLoan,
    nextLoans: loans.map((item) =>
      item.id === validation.loan?.id ? returnedLoan : item
    ),
    nextCopies: copies.map((item) =>
      item.id === validation.copy?.id
        ? { ...item, status: 'AVAILABLE' as const }
        : item
    ),
  };
}
