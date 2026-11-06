# Execução do Plano de Testes de Caixa Preta

## Identificação da execução

| Item | Informação |
|---|---|
| Plano | `docs/BLACK_BOX_TEST_PLAN.md` |
| Data | 06/11/2026 |
| Método | Jest 30 + React Testing Library 16 + `user-event` 14, renderizando páginas reais com `LibraryProvider` |
| Arquivo principal | `frontend/src/pages/__tests__/pages.integration.test.tsx` |
| Isolamento | `localStorage.clear()` antes/depois dos testes; dados iniciais controlados; sem dados reais sensíveis |
| Resultado da suíte | 5 suítes aprovadas; 21 testes aprovados; 0 falhas |

## Casos executados

| ID | Método/evidência | Data | Resultado observado | Status |
|---|---|---|---|---|
| CT-LIV-005 | Teste `BooksPage renderiza a listagem real e permite pesquisar um livro`; busca visual por `Redes` | 06/11/2026 | “Redes de Computadores” permaneceu visível e “Código Limpo” foi removido da listagem. O teste não cobriu termo inexistente nem filtro de disponibilidade. | Aprovado |
| CT-LEI-001 | Teste `ReadersPage cadastra leitor válido e mostra validação de campo obrigatório`; formulário visual | 06/11/2026 | Leitor de Interface foi cadastrado e apareceu na listagem. Nome, identificador e e-mail foram preenchidos; telefone não foi preenchido. | Aprovado |
| CT-LEI-002 | Mesmo teste de página; tentativa de cadastro vazio | 06/11/2026 | A mensagem de nome obrigatório apareceu. A ausência de identificador não foi verificada isoladamente. | Aprovado |
| CT-EMP-001 | Teste `LoansPage realiza empréstimo pelo fluxo de quatro etapas`; wizard visual | 06/11/2026 | O fluxo selecionou leitor regular, livro e `EX-001`, confirmou e encontrou `EX-001` na listagem final. | Aprovado |
| CT-DEV-001 | Teste `ReturnsPage registra devolução e atualiza a aba de histórico`; modal visual | 06/11/2026 | A devolução com data `2026-11-04` fechou o modal e permitiu abrir Histórico. A disponibilidade interna não foi observada diretamente. | Aprovado |
| CT-HIS-001 | Mesmo teste de devolução; aba Histórico | 06/11/2026 | O histórico exibiu o movimento associado ao exemplar `EX-008`. | Aprovado |

## Casos ainda não executados

CT-LIV-001 a CT-LIV-004, CT-LIV-006 e CT-LIV-007; CT-LEI-003 e CT-LEI-004; CT-EMP-002 a CT-EMP-004; CT-DEV-002 e CT-DEV-003; CT-HIS-002; CT-REL-001 a CT-REL-003.

Esses casos permanecem como **Não executado** porque a suíte concluída não reproduziu integralmente seus passos e pré-condições. Não foram considerados aprovados por cobertura indireta de funções internas ou por semelhança parcial.

## Validações técnicas

| Comando | Resultado |
|---|---|
| `corepack pnpm@10 test` | Executado em 06/11/2026: 5 suítes, 21 testes aprovados, 0 falhas. |
| `corepack pnpm@10 test:coverage` | Aprovado: 5 suítes e 21 testes; 72,54% statements, 57,30% branches, 75,55% functions e 73,68% lines. |
| `corepack pnpm@10 exec tsc --noEmit` | Aprovado, sem erros. |
| `corepack pnpm@10 build` | Aprovado: Vite transformou 1.980 módulos e gerou o build de produção. |
