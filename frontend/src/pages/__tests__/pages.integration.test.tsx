import React from 'react';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LibraryProvider } from '../../context/LibraryContext';
import { BooksPage } from '../BooksPage';
import { ReadersPage } from '../ReadersPage';
import { LoansPage } from '../LoansPage';
import { ReturnsPage } from '../ReturnsPage';

function renderPage(page: React.ReactElement) {
  localStorage.clear();
  return render(<LibraryProvider>{page}</LibraryProvider>);
}

describe('interfaces da biblioteca', () => {
  afterEach(() => {
    localStorage.clear();
  });

  test('BooksPage renderiza a listagem real e permite pesquisar um livro', async () => {
    const user = userEvent.setup();
    renderPage(<BooksPage />);

    expect(screen.getAllByText(/C.digo Limpo/).length).toBeGreaterThan(0);
    const search = screen.getByPlaceholderText(/Filtrar por t.tulo/);
    await user.type(search, 'Redes');

    expect(screen.getAllByText('Redes de Computadores').length).toBeGreaterThan(0);
    expect(screen.queryByText(/C.digo Limpo/)).not.toBeInTheDocument();
  });

  test('ReadersPage cadastra leitor válido e mostra validação de e-mail', async () => {
    const user = userEvent.setup();
    renderPage(<ReadersPage />);

    expect(screen.getAllByText(/Carolina Mendes Ramos/).length).toBeGreaterThan(0);
    await user.click(screen.getByRole('button', { name: 'Novo Leitor' }));

    await user.click(screen.getByRole('button', { name: /Cadastrar Leitor/ }));
    expect(screen.getByText(/nome completo do leitor/i)).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText(/Beatriz Silveira/), 'Leitor de Interface');
    await user.type(screen.getByPlaceholderText(/MAT-202510/), 'MAT-UI-001');
    const email = screen.getByPlaceholderText(/beatriz@aluno/);
    await user.type(email, 'interface@example.com');
    await user.click(screen.getByRole('button', { name: /Cadastrar Leitor/ }));
    expect(screen.getAllByText('Leitor de Interface').length).toBeGreaterThan(0);
  });

  test('LoansPage realiza empréstimo pelo fluxo de quatro etapas', async () => {
    const user = userEvent.setup();
    renderPage(<LoansPage />);

    await user.click(screen.getByRole('button', { name: /Novo empr/ }));
    await user.click(screen.getByRole('button', { name: /Gabriel Alves Ribeiro/ }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: /C.digo Limpo/ }));
    await user.click(screen.getByRole('button', { name: /EX-001/ }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: 'Continuar' }));
    await user.click(screen.getByRole('button', { name: /Confirmar empr/ }));

    await waitFor(() => expect(screen.getAllByText('EX-001').length).toBeGreaterThan(0));
  });

  test('ReturnsPage registra devolução e atualiza a aba de histórico', async () => {
    const user = userEvent.setup();
    renderPage(<ReturnsPage />);

    expect(screen.getByText(/Empr.stimos aguardando devolu/)).toBeInTheDocument();
    await user.click(screen.getAllByRole('button', { name: /Registrar devolu/ })[0]);

    expect(screen.getByRole('heading', { name: 'Registrar devolução' })).toBeInTheDocument();
    const dateInput = screen.getByLabelText(/Data efetiva da devolu/);
    await user.clear(dateInput);
    await user.type(dateInput, '2026-11-04');
    await user.click(screen.getByRole('button', { name: /Confirmar devolu/ }));

    await waitFor(() => expect(screen.queryByRole('heading', { name: 'Registrar devolução' })).not.toBeInTheDocument());
    await user.click(screen.getByRole('button', { name: /Hist.rico/ }));
    expect(screen.getByText(/Hist.rico de devolu/)).toBeInTheDocument();
    expect(within(document.body).getAllByText('EX-008').length).toBeGreaterThan(0);
  });
});
