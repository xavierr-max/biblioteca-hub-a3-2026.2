import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Book, BookCopy, Reader, Loan, User, RouteId } from '../types/library';
import {
  INITIAL_BOOKS,
  INITIAL_COPIES,
  INITIAL_READERS,
  INITIAL_LOANS,
  INITIAL_USERS,
} from '../data/mockData';
import { applyReturnOperation } from '../domain/returnRules';

interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  variant?: 'default' | 'success' | 'warning' | 'danger';
}

export interface BookFormData {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  totalCopies: number;
  notes?: string;
}

export interface ReaderFormData {
  name: string;
  identifier: string;
  email?: string;
  phone?: string;
  course?: string;
  notes?: string;
}

export interface LoanFormData {
  readerId: string;
  copyId: string;
  loanDate: string;
  dueDate: string;
}

interface LibraryContextType {
  currentRoute: RouteId;
  setCurrentRoute: (route: RouteId) => void;
  books: Book[];
  copies: BookCopy[];
  readers: Reader[];
  loans: Loan[];
  users: User[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  globalSearch: string;
  setGlobalSearch: (term: string) => void;
  toasts: ToastMessage[];
  showToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  resetToDefaultData: () => void;
  addBook: (data: BookFormData) => { success: boolean; error?: string };
  updateBook: (id: string, data: BookFormData) => { success: boolean; error?: string };
  deleteBook: (id: string) => { success: boolean; error?: string; canArchiveInstead?: boolean };
  toggleArchiveBook: (id: string) => void;
  updateCopyStatus: (copyId: string, status: BookCopy['status'], location?: string) => { success: boolean; error?: string };
  addReader: (data: ReaderFormData) => { success: boolean; error?: string };
  updateReader: (id: string, data: ReaderFormData) => { success: boolean; error?: string };
  deleteReader: (id: string) => { success: boolean; error?: string; canDeactivateInstead?: boolean };
  toggleReaderStatus: (id: string) => void;
  addLoan: (data: LoanFormData) => { success: boolean; error?: string; loan?: Loan };
  registerReturn: (
    loanId: string,
    returnDate: string
  ) => { success: boolean; error?: string; loan?: Loan };
}

const LibraryContext = createContext<LibraryContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'bibliotecahub_v1_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn(`Error reading localStorage key ${key}:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn(`Error writing to localStorage key ${key}:`, e);
  }
}

export function validateISBN(isbn: string): boolean {
  const cleaned = isbn.replace(/[-\s]/g, '');
  if (cleaned.length === 10) {
    // ISBN-10 check
    let sum = 0;
    for (let i = 0; i < 9; i++) {
      const digit = parseInt(cleaned[i], 10);
      if (isNaN(digit)) return false;
      sum += digit * (10 - i);
    }
    const lastChar = cleaned[9].toUpperCase();
    const checkDigit = lastChar === 'X' ? 10 : parseInt(lastChar, 10);
    if (isNaN(checkDigit)) return false;
    sum += checkDigit;
    return sum % 11 === 0;
  } else if (cleaned.length === 13) {
    // ISBN-13 check
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      const digit = parseInt(cleaned[i], 10);
      if (isNaN(digit)) return false;
      sum += digit * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = parseInt(cleaned[12], 10);
    if (isNaN(checkDigit)) return false;
    const remainder = sum % 10;
    const expectedCheckDigit = remainder === 0 ? 0 : 10 - remainder;
    return checkDigit === expectedCheckDigit;
  }
  return false;
}

export function cleanISBN(isbn: string): string {
  return isbn.replace(/[-\s]/g, '');
}

export function isValidEmail(email: string): boolean {
  if (!email) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  if (!phone) return true;
  // Accept numbers with or without parens, spaces, dashes: (11) 98765-4321, 11987654321, 11 98765-4321, 98765-4321, etc.
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 8 && cleaned.length <= 13;
}

export const LibraryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentRoute, setCurrentRoute] = useState<RouteId>('dashboard');
  const [globalSearch, setGlobalSearch] = useState<string>('');
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [books, setBooks] = useState<Book[]>(() =>
    loadFromStorage('books', INITIAL_BOOKS)
  );
  const [copies, setCopies] = useState<BookCopy[]>(() =>
    loadFromStorage('copies', INITIAL_COPIES)
  );
  const [readers, setReaders] = useState<Reader[]>(() =>
    loadFromStorage('readers', INITIAL_READERS)
  );
  const [loans, setLoans] = useState<Loan[]>(() =>
    loadFromStorage('loans', INITIAL_LOANS)
  );
  const [users, setUsers] = useState<User[]>(() =>
    loadFromStorage('users', INITIAL_USERS)
  );
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = loadFromStorage<User | null>('currentUser', null);
    return saved || INITIAL_USERS[0];
  });

  // Recalculate book totals based on actual copies
  const syncBookAvailability = (allBooks: Book[], allCopies: BookCopy[]): Book[] => {
    return allBooks.map((b) => {
      const bookCopies = allCopies.filter((c) => c.bookId === b.id);
      const available = bookCopies.filter((c) => c.status === 'AVAILABLE').length;
      const total = bookCopies.length > 0 ? bookCopies.length : b.totalCopies;
      return {
        ...b,
        totalCopies: total,
        availableCopies: available,
      };
    });
  };

  const syncReaderLoanCounts = (allReaders: Reader[], allLoans: Loan[]): Reader[] => {
    return allReaders.map((reader) => ({
      ...reader,
      activeLoansCount: allLoans.filter(
        (loan) =>
          loan.readerId === reader.id &&
          loan.status !== 'RETURNED' &&
          !loan.returnDate
      ).length,
    }));
  };

  // Persist state updates
  useEffect(() => {
    saveToStorage('books', books);
  }, [books]);

  useEffect(() => {
    saveToStorage('copies', copies);
  }, [copies]);

  useEffect(() => {
    saveToStorage('readers', readers);
  }, [readers]);

  useEffect(() => {
    saveToStorage('loans', loans);
  }, [loans]);

  useEffect(() => {
    saveToStorage('users', users);
  }, [users]);

  useEffect(() => {
    saveToStorage('currentUser', currentUser);
  }, [currentUser]);

  // Keep derived counters compatible with persisted data after reloads or
  // older versions of the local prototype. The underlying records remain
  // unchanged; only their denormalized counters are repaired.
  useEffect(() => {
    const synchronizedBooks = syncBookAvailability(books, copies);
    if (JSON.stringify(synchronizedBooks) !== JSON.stringify(books)) {
      setBooks(synchronizedBooks);
    }

    const synchronizedReaders = syncReaderLoanCounts(readers, loans);
    if (JSON.stringify(synchronizedReaders) !== JSON.stringify(readers)) {
      setReaders(synchronizedReaders);
    }
  }, [books, copies, readers, loans]);

  const showToast = (toast: Omit<ToastMessage, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastMessage = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 4500);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const resetToDefaultData = () => {
    setBooks(INITIAL_BOOKS);
    setCopies(INITIAL_COPIES);
    setReaders(INITIAL_READERS);
    setLoans(INITIAL_LOANS);
    setUsers(INITIAL_USERS);
    setCurrentUser(INITIAL_USERS[0]);
    (['books', 'copies', 'readers', 'loans', 'users', 'currentUser'] as const).forEach(
      (key) => localStorage.removeItem(STORAGE_KEY_PREFIX + key)
    );
    showToast({
      title: 'Dados restaurados',
      description: 'A base de dados de demonstração foi redefinida.',
      variant: 'default',
    });
  };

  const addBook = (data: BookFormData): { success: boolean; error?: string } => {
    const title = data.title.trim();
    const author = data.author.trim();
    const rawIsbn = data.isbn.trim();
    const category = data.category.trim() || 'Geral';
    const publisher = data.publisher.trim() || 'Editora Independente';
    const year = Number(data.year) || new Date().getFullYear();
    const totalCopies = Math.max(0, Number(data.totalCopies) || 0);

    if (!title) {
      return { success: false, error: 'O título do livro é obrigatório.' };
    }
    if (!author) {
      return { success: false, error: 'O autor do livro é obrigatório.' };
    }
    if (!rawIsbn) {
      return { success: false, error: 'O ISBN é obrigatório.' };
    }
    if (!validateISBN(rawIsbn)) {
      return { success: false, error: 'ISBN inválido. Informe um código ISBN-10 ou ISBN-13 válido com dígito verificador correto.' };
    }

    const cleanedNewIsbn = cleanISBN(rawIsbn);
    const isDuplicate = books.some((b) => cleanISBN(b.isbn) === cleanedNewIsbn);
    if (isDuplicate) {
      return { success: false, error: 'Já existe um livro cadastrado com este ISBN.' };
    }

    const newBookId = `b-${Date.now()}`;
    const newCopies: BookCopy[] = [];

    // Generate consecutive copy codes
    const existingCodeNumbers = copies
      .map((c) => {
        const match = c.code.match(/EX-(\d+)/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter((n) => !isNaN(n));
    let maxCode = existingCodeNumbers.length > 0 ? Math.max(...existingCodeNumbers) : 0;

    for (let i = 0; i < totalCopies; i++) {
      maxCode++;
      const codeStr = `EX-${maxCode.toString().padStart(3, '0')}`;
      newCopies.push({
        id: `c-${Date.now()}-${i}`,
        bookId: newBookId,
        code: codeStr,
        status: 'AVAILABLE',
        location: 'Estante Geral',
      });
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newBook: Book = {
      id: newBookId,
      title,
      author,
      isbn: rawIsbn,
      category,
      publisher,
      year,
      totalCopies,
      availableCopies: totalCopies,
      notes: data.notes?.trim() || undefined,
      createdAt: todayStr,
      isArchived: false,
    };

    setCopies((prev) => [...prev, ...newCopies]);
    setBooks((prev) => [newBook, ...prev]);

    showToast({
      title: 'Livro cadastrado',
      description: `"${title}" foi adicionado com ${totalCopies} exemplar(es).`,
      variant: 'success',
    });

    return { success: true };
  };

  const updateBook = (id: string, data: BookFormData): { success: boolean; error?: string } => {
    const book = books.find((b) => b.id === id);
    if (!book) {
      return { success: false, error: 'Livro não encontrado para atualização.' };
    }

    const title = data.title.trim();
    const author = data.author.trim();
    const rawIsbn = data.isbn.trim();
    const category = data.category.trim() || 'Geral';
    const publisher = data.publisher.trim() || 'Editora Independente';
    const year = Number(data.year) || new Date().getFullYear();
    const requestedTotalCopies = Math.max(0, Number(data.totalCopies) || 0);

    if (!title) {
      return { success: false, error: 'O título do livro é obrigatório.' };
    }
    if (!author) {
      return { success: false, error: 'O autor do livro é obrigatório.' };
    }
    if (!rawIsbn) {
      return { success: false, error: 'O ISBN é obrigatório.' };
    }
    if (!validateISBN(rawIsbn)) {
      return { success: false, error: 'ISBN inválido. Informe um código ISBN-10 ou ISBN-13 válido.' };
    }

    const cleanedNewIsbn = cleanISBN(rawIsbn);
    const isDuplicate = books.some((b) => b.id !== id && cleanISBN(b.isbn) === cleanedNewIsbn);
    if (isDuplicate) {
      return { success: false, error: 'Já existe outro livro cadastrado com este ISBN.' };
    }

    // Check active loans for this book
    const activeLoansForBook = loans.filter(
      (l) => l.bookId === id && (l.status === 'ACTIVE' || l.status === 'OVERDUE')
    );
    const loanedCopiesCount = activeLoansForBook.length;

    if (requestedTotalCopies < loanedCopiesCount) {
      return {
        success: false,
        error: `Não é possível reduzir a quantidade de exemplares para ${requestedTotalCopies}, pois existem ${loanedCopiesCount} exemplar(es) atualmente emprestados.`,
      };
    }

    // Adjust copies
    const currentBookCopies = copies.filter((c) => c.bookId === id);
    const currentCount = currentBookCopies.length;
    let updatedAllCopies = [...copies];

    if (requestedTotalCopies > currentCount) {
      // Add new available copies
      const toAdd = requestedTotalCopies - currentCount;
      const existingCodeNumbers = copies
        .map((c) => {
          const match = c.code.match(/EX-(\d+)/);
          return match ? parseInt(match[1], 10) : 0;
        })
        .filter((n) => !isNaN(n));
      let maxCode = existingCodeNumbers.length > 0 ? Math.max(...existingCodeNumbers) : 0;
      const newAddedCopies: BookCopy[] = [];
      for (let i = 0; i < toAdd; i++) {
        maxCode++;
        newAddedCopies.push({
          id: `c-${Date.now()}-${i}`,
          bookId: id,
          code: `EX-${maxCode.toString().padStart(3, '0')}`,
          status: 'AVAILABLE',
          location: 'Estante Geral',
        });
      }
      updatedAllCopies = [...updatedAllCopies, ...newAddedCopies];
    } else if (requestedTotalCopies < currentCount) {
      // Remove available copies only (never remove loaned copies)
      const toRemoveCount = currentCount - requestedTotalCopies;
      const nonLoanedCopies = currentBookCopies.filter((c) => c.status !== 'LOANED');
      const availableToRemove = nonLoanedCopies.filter((c) => c.status === 'AVAILABLE');
      const otherNonLoaned = nonLoanedCopies.filter((c) => c.status !== 'AVAILABLE');
      const removablePriority = [...availableToRemove, ...otherNonLoaned];

      const idsToRemove = new Set(
        removablePriority.slice(0, toRemoveCount).map((c) => c.id)
      );
      updatedAllCopies = updatedAllCopies.filter((c) => !idsToRemove.has(c.id));
    }

    const updatedBookCopies = updatedAllCopies.filter((c) => c.bookId === id);
    const finalAvailableCount = updatedBookCopies.filter((c) => c.status === 'AVAILABLE').length;

    setCopies(updatedAllCopies);
    setBooks((prev) =>
      prev.map((b) =>
        b.id === id
          ? {
              ...b,
              title,
              author,
              isbn: rawIsbn,
              category,
              publisher,
              year,
              totalCopies: requestedTotalCopies,
              availableCopies: finalAvailableCount,
              notes: data.notes?.trim() || undefined,
            }
          : b
      )
    );

    showToast({
      title: 'Livro atualizado',
      description: `As informações de "${title}" foram atualizadas com sucesso.`,
      variant: 'success',
    });

    return { success: true };
  };

  const deleteBook = (
    id: string
  ): { success: boolean; error?: string; canArchiveInstead?: boolean } => {
    const book = books.find((b) => b.id === id);
    if (!book) {
      return { success: false, error: 'Livro não encontrado.' };
    }

    // Check any loan history (active, overdue or returned)
    const bookLoans = loans.filter((l) => l.bookId === id);
    if (bookLoans.length > 0) {
      const hasActive = bookLoans.some((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');
      const message = hasActive
        ? `O livro "${book.title}" possui empréstimos em andamento e não pode ser excluído permanentemente.`
        : `O livro "${book.title}" possui histórico de ${bookLoans.length} empréstimo(s) registrado(s). Para preservar a integridade histórica dos dados acadêmicos, o título não pode ser excluído definitivamente.`;

      return {
        success: false,
        error: message,
        canArchiveInstead: true,
      };
    }

    // Safe to delete completely along with its physical copies
    setCopies((prev) => prev.filter((c) => c.bookId !== id));
    setBooks((prev) => prev.filter((b) => b.id !== id));

    showToast({
      title: 'Livro excluído',
      description: `"${book.title}" e seus exemplares foram removidos do acervo.`,
      variant: 'default',
    });

    return { success: true };
  };

  const toggleArchiveBook = (id: string) => {
    const book = books.find((b) => b.id === id);
    if (!book) return;
    const newArchived = !book.isArchived;

    setBooks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, isArchived: newArchived } : b))
    );

    showToast({
      title: newArchived ? 'Título desativado/arquivado' : 'Título reativado',
      description: newArchived
        ? `"${book.title}" foi arquivado para preservar o histórico sem permitir novas operações.`
        : `"${book.title}" está novamente ativo no catálogo principal.`,
      variant: 'default',
    });
  };

  const updateCopyStatus = (
    copyId: string,
    newStatus: BookCopy['status'],
    newLocation?: string
  ): { success: boolean; error?: string } => {
    const copy = copies.find((c) => c.id === copyId);
    if (!copy) {
      return { success: false, error: 'Exemplar não encontrado.' };
    }

    // Rule: Cannot manually mark copy as AVAILABLE if there is an active loan associated
    const hasActiveLoan = loans.some(
      (l) =>
        (l.copyId === copy.id ||
          (!l.copyId &&
            l.copyCode === copy.code &&
            l.bookId === copy.bookId)) &&
        (l.status === 'ACTIVE' || l.status === 'OVERDUE')
    );

    if (newStatus === 'AVAILABLE' && hasActiveLoan) {
      return {
        success: false,
        error: `O exemplar ${copy.code} está atualmente emprestado e só poderá ficar disponível após o registro de sua devolução.`,
      };
    }

    const updatedCopies = copies.map((c) =>
      c.id === copyId
        ? {
            ...c,
            status: newStatus,
            location: newLocation !== undefined ? newLocation : c.location,
          }
        : c
    );

    setCopies(updatedCopies);

    // Recompute available count on corresponding book
    const bookCopies = updatedCopies.filter((c) => c.bookId === copy.bookId);
    const availCount = bookCopies.filter((c) => c.status === 'AVAILABLE').length;
    setBooks((prev) =>
      prev.map((b) =>
        b.id === copy.bookId ? { ...b, availableCopies: availCount } : b
      )
    );

    showToast({
      title: 'Exemplar atualizado',
      description: `Situação do exemplar ${copy.code} alterada para ${newStatus}.`,
      variant: 'success',
    });

    return { success: true };
  };

  const addReader = (data: ReaderFormData): { success: boolean; error?: string } => {
    const name = data.name.trim();
    const identifier = data.identifier.trim();
    const email = data.email?.trim() || '';
    const phone = data.phone?.trim() || '';
    const course = data.course?.trim() || undefined;
    const notes = data.notes?.trim() || undefined;

    if (!name) {
      return { success: false, error: 'O nome completo do leitor é obrigatório.' };
    }
    if (!identifier) {
      return { success: false, error: 'A matrícula ou identificador acadêmico é obrigatório.' };
    }

    const isDuplicateIdentifier = readers.some(
      (r) =>
        (r.identifier || r.cpf || '').toLowerCase() === identifier.toLowerCase()
    );
    if (isDuplicateIdentifier) {
      return {
        success: false,
        error: `Já existe um leitor cadastrado com a matrícula/identificador "${identifier}".`,
      };
    }

    if (email && !isValidEmail(email)) {
      return { success: false, error: 'O formato do e-mail informado é inválido.' };
    }
    if (phone && !isValidPhone(phone)) {
      return { success: false, error: 'O formato do telefone informado é inválido. Digite um número com DDD (8 a 11 dígitos).' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const newReaderId = `r-${Date.now()}`;

    const newReader: Reader = {
      id: newReaderId,
      name,
      identifier,
      email,
      phone,
      course,
      notes,
      registrationDate: todayStr,
      status: 'REGULAR',
      activeLoansCount: 0,
    };

    setReaders((prev) => [newReader, ...prev]);

    showToast({
      title: 'Leitor cadastrado',
      description: `${name} foi registrado com sucesso sob a matrícula ${identifier}.`,
      variant: 'success',
    });

    return { success: true };
  };

  const updateReader = (id: string, data: ReaderFormData): { success: boolean; error?: string } => {
    const reader = readers.find((r) => r.id === id);
    if (!reader) {
      return { success: false, error: 'Leitor não encontrado para atualização.' };
    }

    const name = data.name.trim();
    const identifier = data.identifier.trim();
    const email = data.email?.trim() || '';
    const phone = data.phone?.trim() || '';
    const course = data.course?.trim() || undefined;
    const notes = data.notes?.trim() || undefined;

    if (!name) {
      return { success: false, error: 'O nome completo do leitor é obrigatório.' };
    }
    if (!identifier) {
      return { success: false, error: 'A matrícula ou identificador acadêmico é obrigatório.' };
    }

    const isDuplicateIdentifier = readers.some(
      (r) =>
        r.id !== id &&
        (r.identifier || r.cpf || '').toLowerCase() === identifier.toLowerCase()
    );
    if (isDuplicateIdentifier) {
      return {
        success: false,
        error: `Já existe outro leitor cadastrado com a matrícula/identificador "${identifier}".`,
      };
    }

    if (email && !isValidEmail(email)) {
      return { success: false, error: 'O formato do e-mail informado é inválido.' };
    }
    if (phone && !isValidPhone(phone)) {
      return { success: false, error: 'O formato do telefone informado é inválido.' };
    }

    setReaders((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              name,
              identifier,
              email,
              phone,
              course,
              notes,
            }
          : r
      )
    );

    showToast({
      title: 'Leitor atualizado',
      description: `Os dados cadastrais de ${name} foram atualizados.`,
      variant: 'success',
    });

    return { success: true };
  };

  const deleteReader = (
    id: string
  ): { success: boolean; error?: string; canDeactivateInstead?: boolean } => {
    const reader = readers.find((r) => r.id === id);
    if (!reader) {
      return { success: false, error: 'Leitor não encontrado.' };
    }

    // Check loans associated with this reader
    const readerLoans = loans.filter((l) => l.readerId === id);
    const activeLoans = readerLoans.filter((l) => l.status === 'ACTIVE' || l.status === 'OVERDUE');

    if (activeLoans.length > 0) {
      return {
        success: false,
        error: `Não é possível excluir o leitor "${reader.name}", pois ele possui ${activeLoans.length} empréstimo(s) em andamento.`,
        canDeactivateInstead: false,
      };
    }

    if (readerLoans.length > 0) {
      return {
        success: false,
        error: `O leitor "${reader.name}" possui histórico de ${readerLoans.length} empréstimo(s) no sistema acadêmico. Para preservar o histórico, este cadastro não pode ser excluído permanentemente.`,
        canDeactivateInstead: true,
      };
    }

    // Safe to delete reader completely
    setReaders((prev) => prev.filter((r) => r.id !== id));

    showToast({
      title: 'Leitor excluído',
      description: `O cadastro de ${reader.name} foi removido com sucesso.`,
      variant: 'default',
    });

    return { success: true };
  };

  const toggleReaderStatus = (id: string) => {
    const reader = readers.find((r) => r.id === id);
    if (!reader) return;

    const newStatus: Reader['status'] = reader.status === 'REGULAR' ? 'SUSPENDED' : 'REGULAR';

    setReaders((prev) =>
      prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
    );

    showToast({
      title: newStatus === 'SUSPENDED' ? 'Leitor desativado / suspenso' : 'Leitor reativado',
      description:
        newStatus === 'SUSPENDED'
          ? `${reader.name} agora está inativo para novos empréstimos, mas seu histórico permanece acessível.`
          : `${reader.name} teve sua situação regularizada no sistema.`,
      variant: newStatus === 'SUSPENDED' ? 'warning' : 'success',
    });
  };

  const addLoan = (
    data: LoanFormData
  ): { success: boolean; error?: string; loan?: Loan } => {
    const reader = readers.find((item) => item.id === data.readerId);
    if (!reader) {
      return { success: false, error: 'O leitor selecionado não existe mais.' };
    }
    if (reader.status !== 'REGULAR') {
      return {
        success: false,
        error: 'O leitor selecionado está inativo ou suspenso e não pode realizar empréstimos.',
      };
    }

    const copy = copies.find((item) => item.id === data.copyId);
    if (!copy) {
      return { success: false, error: 'O exemplar selecionado não existe mais.' };
    }
    if (copy.status !== 'AVAILABLE') {
      return {
        success: false,
        error: `O exemplar ${copy.code} não está mais disponível para empréstimo.`,
      };
    }

    const book = books.find((item) => item.id === copy.bookId);
    if (!book) {
      return { success: false, error: 'O livro vinculado ao exemplar não existe mais.' };
    }
    if (book.isArchived) {
      return {
        success: false,
        error: 'O título selecionado está arquivado e não permite novos empréstimos.',
      };
    }

    const hasOpenLoan = loans.some(
      (loan) =>
        loan.status !== 'RETURNED' &&
        (loan.copyId === copy.id ||
          (!loan.copyId && loan.bookId === copy.bookId && loan.copyCode === copy.code))
    );
    if (hasOpenLoan) {
      return {
        success: false,
        error: `O exemplar ${copy.code} já está associado a outro empréstimo em aberto.`,
      };
    }

    const loanDate = new Date(`${data.loanDate}T12:00:00`);
    const dueDate = new Date(`${data.dueDate}T12:00:00`);
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    if (
      !data.loanDate ||
      !data.dueDate ||
      Number.isNaN(loanDate.getTime()) ||
      Number.isNaN(dueDate.getTime())
    ) {
      return { success: false, error: 'Informe datas válidas para o empréstimo.' };
    }
    if (loanDate > today) {
      return { success: false, error: 'A data do empréstimo não pode estar no futuro.' };
    }
    if (dueDate <= loanDate) {
      return {
        success: false,
        error: 'A previsão de devolução deve ser posterior à data do empréstimo.',
      };
    }

    const uniquePart = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const newLoan: Loan = {
      id: `l-${uniquePart}`,
      bookId: book.id,
      bookTitle: book.title,
      copyId: copy.id,
      copyCode: copy.code,
      readerId: reader.id,
      readerName: reader.name,
      loanDate: data.loanDate,
      dueDate: data.dueDate,
      status: 'ACTIVE',
    };

    const nextCopies = copies.map((item) =>
      item.id === copy.id ? { ...item, status: 'LOANED' as const } : item
    );
    const availableCopies = nextCopies.filter(
      (item) => item.bookId === book.id && item.status === 'AVAILABLE'
    ).length;

    setLoans((current) => [newLoan, ...current]);
    setCopies(nextCopies);
    setBooks((current) =>
      current.map((item) =>
        item.id === book.id ? { ...item, availableCopies } : item
      )
    );
    setReaders((current) =>
      current.map((item) =>
        item.id === reader.id
          ? {
              ...item,
              activeLoansCount:
                loans.filter(
                  (loan) =>
                    loan.readerId === reader.id &&
                    loan.status !== 'RETURNED' &&
                    !loan.returnDate
                ).length + 1,
            }
          : item
      )
    );

    showToast({
      title: 'Empréstimo registrado',
      description: `${book.title} foi emprestado para ${reader.name}.`,
      variant: 'success',
    });

    return { success: true, loan: newLoan };
  };

  const registerReturn = (
    loanId: string,
    returnDate: string
  ): { success: boolean; error?: string; loan?: Loan } => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const todayValue = new Date(today.getTime() - offset * 60 * 1000)
      .toISOString()
      .split('T')[0];
    const mutation = applyReturnOperation(
      loanId,
      returnDate,
      loans,
      copies,
      todayValue
    );
    if (
      !mutation.success ||
      !mutation.loan ||
      !mutation.copy ||
      !mutation.returnedLoan ||
      !mutation.nextLoans ||
      !mutation.nextCopies
    ) {
      return {
        success: false,
        error:
          mutation.error ||
          'Não foi possível validar os dados desta devolução.',
      };
    }

    const loan = mutation.loan;
    const returnedLoan = mutation.returnedLoan;
    const nextLoans = mutation.nextLoans;
    const nextCopies = mutation.nextCopies;
    const availableCopies = nextCopies.filter(
      (item) => item.bookId === loan.bookId && item.status === 'AVAILABLE'
    ).length;
    const activeReaderLoans = nextLoans.filter(
      (item) =>
        item.readerId === loan.readerId &&
        item.status !== 'RETURNED' &&
        !item.returnDate
    ).length;

    setLoans(nextLoans);
    setCopies(nextCopies);
    setBooks((current) =>
      current.map((item) =>
        item.id === loan.bookId ? { ...item, availableCopies } : item
      )
    );
    setReaders((current) =>
      current.map((item) =>
        item.id === loan.readerId
          ? { ...item, activeLoansCount: activeReaderLoans }
          : item
      )
    );

    const wasLate =
      new Date(`${returnDate}T12:00:00`) >
      new Date(`${loan.dueDate}T12:00:00`);
    showToast({
      title: 'Devolução registrada',
      description: `${loan.bookTitle} foi recebido${
        wasLate ? ' após o prazo previsto' : ' dentro do prazo'
      }.`,
      variant: wasLate ? 'warning' : 'success',
    });

    return { success: true, loan: returnedLoan };
  };

  return (
    <LibraryContext.Provider
      value={{
        currentRoute,
        setCurrentRoute,
        books,
        copies,
        readers,
        loans,
        users,
        currentUser,
        setCurrentUser,
        globalSearch,
        setGlobalSearch,
        toasts,
        showToast,
        removeToast,
        resetToDefaultData,
        addBook,
        updateBook,
        deleteBook,
        toggleArchiveBook,
        updateCopyStatus,
        addReader,
        updateReader,
        deleteReader,
        toggleReaderStatus,
        addLoan,
        registerReturn,
      }}
    >
      {children}
    </LibraryContext.Provider>
  );
};

export function useLibrary() {
  const context = useContext(LibraryContext);
  if (!context) {
    throw new Error('useLibrary must be used within a LibraryProvider');
  }
  return context;
}
