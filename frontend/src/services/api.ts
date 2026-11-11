const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5180/api'

export type Category = { categoryId: number; name: string; isActive: boolean }
export type Author = { authorId: number; name: string }
export type Book = { bookId: number; title: string; isbn13: string; categoryId: number; categoryName?: string; authors?: Author[]; isArchived: boolean }
export type Reader = { readerId: number; fullName: string; registrationNumber: string; isSuspended: boolean }
export type Copy = { copyId: number; bookId: number; inventoryCode: string; status: 'Available' | 'Loaned' | 'Maintenance' | 'Lost' }
export type Loan = { loanId: number; copyId: number; readerId: number; loanedAt: string; dueAt: string; returnedAt: string | null }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!response.ok) throw new Error(await response.text() || `Request failed: ${response.status}`)
  if (response.status === 204) return undefined as T
  return response.json() as Promise<T>
}

export const libraryApi = {
  books: () => request<Book[]>('/books'),
  categories: () => request<Category[]>('/categories'),
  authors: () => request<Author[]>('/authors'),
  createCategory: (body: Pick<Category, 'name' | 'isActive'>) => request<Category>('/categories', { method: 'POST', body: JSON.stringify(body) }),
  updateCategory: (id: number, body: Pick<Category, 'name' | 'isActive'>) => request<Category>(`/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCategory: (id: number) => request<void>(`/categories/${id}`, { method: 'DELETE' }),
  createAuthor: (body: Pick<Author, 'name'>) => request<Author>('/authors', { method: 'POST', body: JSON.stringify(body) }),
  updateAuthor: (id: number, body: Pick<Author, 'name'>) => request<Author>(`/authors/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAuthor: (id: number) => request<void>(`/authors/${id}`, { method: 'DELETE' }),
  createBook: (body: Pick<Book, 'title' | 'isbn13' | 'categoryId'> & { authorIds?: number[] }) => request<Book>('/books', { method: 'POST', body: JSON.stringify(body) }),
  updateBook: (id: number, body: Pick<Book, 'title' | 'isbn13' | 'categoryId' | 'isArchived'> & { authorIds?: number[] }) => request<Book>(`/books/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteBook: (id: number) => request<void>(`/books/${id}`, { method: 'DELETE' }),
  readers: () => request<Reader[]>('/readers'),
  createReader: (body: Pick<Reader, 'fullName' | 'registrationNumber'>) => request<Reader>('/readers', { method: 'POST', body: JSON.stringify(body) }),
  updateReader: (id: number, body: Pick<Reader, 'fullName' | 'registrationNumber' | 'isSuspended'>) => request<Reader>(`/readers/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteReader: (id: number) => request<void>(`/readers/${id}`, { method: 'DELETE' }),
  copies: () => request<Copy[]>('/copies'),
  createCopy: (body: Pick<Copy, 'bookId' | 'inventoryCode'>) => request<Copy>('/copies', { method: 'POST', body: JSON.stringify(body) }),
  updateCopy: (id: number, body: Pick<Copy, 'bookId' | 'inventoryCode' | 'status'>) => request<Copy>(`/copies/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteCopy: (id: number) => request<void>(`/copies/${id}`, { method: 'DELETE' }),
  loans: () => request<Loan[]>('/loans'),
  createLoan: (body: Pick<Loan, 'readerId' | 'copyId'>) => request<Loan>('/loans', { method: 'POST', body: JSON.stringify(body) }),
  updateLoan: (id: number, body: Pick<Loan, 'readerId' | 'copyId' | 'dueAt' | 'returnedAt'>) => request<Loan>(`/loans/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteLoan: (id: number) => request<void>(`/loans/${id}`, { method: 'DELETE' }),
  returnLoan: (loanId: number) => request<Loan>(`/loans/${loanId}/return`, { method: 'POST' }),
}
