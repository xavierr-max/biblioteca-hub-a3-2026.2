export type UserRole = 'ADMIN' | 'LIBRARIAN' | 'READER';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
}

export interface BookCopy {
  id: string;
  bookId: string;
  code: string; // Ex: EX-001
  status: 'AVAILABLE' | 'LOANED' | 'MAINTENANCE' | 'LOST';
  location: string; // Estante A-2
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  totalCopies: number;
  availableCopies: number;
  coverUrl?: string;
  notes?: string;
  createdAt?: string;
  isArchived?: boolean;
}

export interface Reader {
  id: string;
  name: string;
  identifier: string; // Matrícula ou identificador acadêmico (ex: MAT-202401)
  cpf?: string;
  email: string;
  phone: string;
  course?: string; // Curso ou vínculo institucional
  notes?: string;
  registrationDate: string;
  status: 'REGULAR' | 'SUSPENDED' | 'BLOCKED';
  activeLoansCount: number;
}

export interface Loan {
  id: string;
  bookId: string;
  bookTitle: string;
  copyId?: string;
  copyCode: string;
  readerId: string;
  readerName: string;
  loanDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'ACTIVE' | 'OVERDUE' | 'RETURNED';
}

export type RouteId = 
  | 'dashboard' 
  | 'books' 
  | 'readers' 
  | 'loans' 
  | 'returns' 
  | 'reports' 
  | 'users';
