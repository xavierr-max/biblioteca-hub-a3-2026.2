import { createBook, listBooks } from '../bookService';

const bookResponse = {
  id: '00000000-0000-0000-0000-000000000001', title: 'Clean Code', author: 'Robert Martin',
  isbn: '9780306406157', category: 'Técnico', publisher: 'Prentice', year: 2008,
  totalCopies: 1, availableCopies: 1, isArchived: false,
  copies: [{ id: '00000000-0000-0000-0000-000000000002', code: 'EX-1', status: 'AVAILABLE', location: 'Estante Geral' }],
};

const response = (body: unknown, status: number) => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => JSON.stringify(body),
});

describe('book API service', () => {
  let fetchMock: jest.Mock;

  beforeEach(() => {
    fetchMock = jest.fn();
    Object.defineProperty(globalThis, 'fetch', { configurable: true, writable: true, value: fetchMock });
  });

  it('consulta livros e mapeia exemplares', async () => {
    fetchMock.mockResolvedValue(response([bookResponse], 200));
    const result = await listBooks();
    expect(result.books[0]).toMatchObject({ id: bookResponse.id, title: 'Clean Code' });
    expect(result.copies[0]).toMatchObject({ bookId: bookResponse.id, code: 'EX-1' });
  });

  it('cadastra livro usando POST', async () => {
    fetchMock.mockResolvedValue(response(bookResponse, 201));
    const result = await createBook({ title: 'Clean Code', author: 'Robert Martin', isbn: '9780306406157', category: 'Técnico', publisher: 'Prentice', year: 2008, totalCopies: 1 });
    expect(fetchMock).toHaveBeenCalledWith('http://localhost:5219/api/books', expect.objectContaining({ method: 'POST' }));
    expect(result.book.id).toBe(bookResponse.id);
  });

  it('propaga erro HTTP retornado pela API', async () => {
    fetchMock.mockResolvedValue(response({ error: 'ISBN duplicado.' }, 400));
    await expect(createBook({ title: 'Duplicado', author: 'Autor', isbn: '9780306406157', category: 'Geral', publisher: 'Editora', year: 2020, totalCopies: 1 })).rejects.toThrow('ISBN duplicado.');
  });

  it('converte falha de conexão em erro de comunicação', async () => {
    fetchMock.mockRejectedValue(new TypeError('network failure'));
    await expect(listBooks()).rejects.toThrow('Não foi possível conectar à API da Biblioteca.');
  });
});
