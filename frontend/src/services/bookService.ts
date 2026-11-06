import { Book, BookCopy } from '../types/library';
import { requestJson } from './httpClient';

export interface BookInput {
  title: string;
  author: string;
  isbn: string;
  category: string;
  publisher: string;
  year: number;
  totalCopies: number;
  notes?: string;
}

interface BookDto extends Omit<Book, 'createdAt' | 'coverUrl' | 'notes' | 'copies'> {
  copies: Array<{ id: string; code: string; status: string; location: string }>;
}

function mapCopy(copy: BookDto['copies'][number], bookId: string): BookCopy {
  return { ...copy, bookId, status: copy.status.toUpperCase() as BookCopy['status'] };
}

function mapBook(dto: BookDto): Book {
  return {
    id: dto.id,
    title: dto.title,
    author: dto.author,
    isbn: dto.isbn,
    category: dto.category,
    publisher: dto.publisher,
    year: dto.year,
    totalCopies: dto.totalCopies,
    availableCopies: dto.availableCopies,
    isArchived: dto.isArchived,
  } as Book;
}

export async function listBooks(): Promise<{ books: Book[]; copies: BookCopy[] }> {
  const response = await requestJson<BookDto[]>('/api/books');
  return {
    books: response.map(mapBook),
    copies: response.flatMap((book) => book.copies.map((copy) => mapCopy(copy, book.id))),
  };
}

export async function createBook(input: BookInput): Promise<{ book: Book; copies: BookCopy[] }> {
  const response = await requestJson<BookDto>('/api/books', { method: 'POST', body: JSON.stringify(input) });
  return {
    book: mapBook(response),
    copies: response.copies.map((copy) => mapCopy(copy, response.id)),
  };
}
