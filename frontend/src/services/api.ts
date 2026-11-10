const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5180/api'

export type Book = { bookId: number; title: string; isbn13: string; categoryId: number; isArchived: boolean }
export type Reader = { readerId: number; fullName: string; registrationNumber: string; isSuspended: boolean }
export type Copy = { copyId: number; bookId: number; inventoryCode: string; status: 'Available' | 'Loaned' | 'Maintenance' | 'Lost' }
export type Loan = { loanId: number; copyId: number; readerId: number; loanedAt: string; dueAt: string; returnedAt: string | null }

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!response.ok) throw new Error(await response.text() || `Request failed: ${response.status}`)
  return response.json() as Promise<T>
}

export const libraryApi = {
  books: () => request<Book[]>('/books'),
  createBook: (body: Pick<Book, 'title' | 'isbn13' | 'categoryId'>) => request<Book>('/books', { method: 'POST', body: JSON.stringify(body) }),
  readers: () => request<Reader[]>('/readers'),
  createReader: (body: Pick<Reader, 'fullName' | 'registrationNumber'>) => request<Reader>('/readers', { method: 'POST', body: JSON.stringify(body) }),
  copies: () => request<Copy[]>('/copies'),
  createCopy: (body: Pick<Copy, 'bookId' | 'inventoryCode'>) => request<Copy>('/copies', { method: 'POST', body: JSON.stringify(body) }),
  loans: () => request<Loan[]>('/loans'),
  createLoan: (body: Pick<Loan, 'readerId' | 'copyId'>) => request<Loan>('/loans', { method: 'POST', body: JSON.stringify(body) }),
  returnLoan: (loanId: number) => request<Loan>(`/loans/${loanId}/return`, { method: 'POST' }),
}
