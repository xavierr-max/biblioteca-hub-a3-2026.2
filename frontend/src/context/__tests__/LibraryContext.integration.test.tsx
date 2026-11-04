import React from 'react';
import { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { LibraryProvider, useLibrary } from '../LibraryContext';

describe('integração do LibraryContext', () => {
  let root: Root;
  let container: HTMLDivElement;
  let api: any;

  function Harness() {
    api = useLibrary();
    return null;
  }

  beforeEach(async () => {
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    await act(async () => {
      root = createRoot(container);
      root.render(<LibraryProvider><Harness /></LibraryProvider>);
    });
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    localStorage.clear();
  });

  test('cadastra, edita e exclui livro sem empréstimos', async () => {
    let result: any;
    await act(async () => {
      result = api.addBook({ title: 'Livro Novo', author: 'Autor', isbn: '978-0306406157', category: 'Teste', publisher: 'Editora', year: 2026, totalCopies: 2 });
    });
    expect(result.success).toBe(true);
    const created = api.books.find((book: any) => book.title === 'Livro Novo');
    expect(created).toMatchObject({ totalCopies: 2, availableCopies: 2 });
    expect(api.copies.filter((copy: any) => copy.bookId === created.id)).toHaveLength(2);

    await act(async () => { result = api.updateBook(created.id, { title: 'Livro Editado', author: 'Autor 2', isbn: created.isbn, category: 'Teste', publisher: 'Editora', year: 2026, totalCopies: 1 }); });
    expect(result.success).toBe(true);
    expect(api.books.find((book: any) => book.id === created.id)).toMatchObject({ title: 'Livro Editado', totalCopies: 1 });

    await act(async () => { result = api.deleteBook(created.id); });
    expect(result.success).toBe(true);
    expect(api.books.some((book: any) => book.id === created.id)).toBe(false);
  });

  test('bloqueia ISBN duplicado, leitor inválido e leitor duplicado', async () => {
    let result: any;
    await act(async () => { result = api.addBook({ title: 'Duplicado', author: 'Autor', isbn: api.books[0].isbn, category: '', publisher: '', year: 2026, totalCopies: 1 }); });
    expect(result).toMatchObject({ success: false });
    await act(async () => { result = api.addReader({ name: '', identifier: 'NEW-1' }); });
    expect(result).toMatchObject({ success: false });
    await act(async () => { result = api.addReader({ name: 'Novo Leitor', identifier: 'MAT-NEW', email: 'invalido', phone: '123' }); });
    expect(result).toMatchObject({ success: false });
    await act(async () => { result = api.addReader({ name: 'Novo Leitor', identifier: 'MAT-NEW', email: 'novo@example.com', phone: '11987654321' }); });
    expect(result.success).toBe(true);
    await act(async () => { result = api.addReader({ name: 'Outro', identifier: 'mat-new' }); });
    expect(result).toMatchObject({ success: false });
  });

  test('empresta exemplar disponível, atualiza disponibilidade e devolve', async () => {
    let result: any;
    const before = api.books.find((book: any) => book.id === 'b-1');
    await act(async () => { result = api.addLoan({ readerId: 'r-4', copyId: 'c-1', loanDate: '2026-11-01', dueDate: '2026-11-10' }); });
    expect(result.success).toBe(true);
    const loanId = result.loan.id;
    expect(api.copies.find((copy: any) => copy.id === 'c-1').status).toBe('LOANED');
    expect(api.books.find((book: any) => book.id === 'b-1').availableCopies).toBe(before.availableCopies - 1);
    expect(api.readers.find((reader: any) => reader.id === 'r-4').activeLoansCount).toBe(1);

    await act(async () => { result = api.addLoan({ readerId: 'r-4', copyId: 'c-1', loanDate: '2026-11-01', dueDate: '2026-11-10' }); });
    expect(result.success).toBe(false);
    await act(async () => { result = api.registerReturn(loanId, '2026-11-04'); });
    expect(result.success).toBe(true);
    expect(api.copies.find((copy: any) => copy.id === 'c-1').status).toBe('AVAILABLE');
    expect(api.readers.find((reader: any) => reader.id === 'r-4').activeLoansCount).toBe(0);
  });

  test('persiste estado no localStorage e impede alterações perigosas', async () => {
    let result: any;
    await act(async () => { result = api.updateCopyStatus('c-4', 'AVAILABLE'); });
    expect(result.success).toBe(false);
    await act(async () => { result = api.deleteBook('b-1'); });
    expect(result).toMatchObject({ success: false, canArchiveInstead: true });
    expect(JSON.parse(localStorage.getItem('bibliotecahub_v1_books') || '[]')).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'b-1' })]));
  });
});
