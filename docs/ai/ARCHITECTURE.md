# Arquitetura

## Fase 3 — leitores

Leitores seguem o mesmo fluxo em camadas dos livros: entidade e validações no Domain, DTOs/interface/serviço em Application, configuração EF/DbSet/repositório em Infrastructure e endpoints agrupados em `ReaderEndpointExtensions`.

Os testes de integração são um projeto separado e usam a composição real da API, Application e Infrastructure com SQLite em memória; não substituem repositórios por mocks.

## Backend Fase 1

O backend ASP.NET Core .NET 8 está em `backend/`, com camadas Domain, Application, Infrastructure e Api. EF Core/Npgsql persiste livros e exemplares; a API ainda não substitui o `localStorage` do frontend.

Cada classe principal possui arquivo próprio. DbContext, configurações EF e repositório estão separados em Infrastructure; DTOs, interfaces e serviços estão separados em Application; endpoints permanecem Minimal API, agrupados por extensão.

## Estrutura

- `frontend/src/main.tsx`: entrada da aplicação.
- `frontend/src/App.tsx`: composição principal e rotas visuais.
- `frontend/src/pages/`: telas de livros, leitores, empréstimos, devoluções, relatórios, usuários e dashboard.
- `frontend/src/components/`: componentes reutilizáveis de UI e layout.
- `frontend/src/context/LibraryContext.tsx`: estado global, persistência e mutações de negócio.
- `frontend/src/domain/`: regras puras de devolução e relatórios.
- `frontend/src/data/mockData.ts`: dados iniciais.
- `frontend/src/types/library.ts`: tipos compartilhados.

## Fluxo de dados

`LibraryProvider` carrega dados iniciais ou do `localStorage`, expõe operações via `useLibrary`, atualiza livros/exemplares/leitores/empréstimos e persiste cada coleção com a chave `bibliotecahub_v1_*`. As páginas consomem o contexto e controlam o estado efêmero de formulários e filtros.

## Convenções

Regras que não dependem de React devem permanecer em funções puras em `domain/`. Testes ficam próximos ao módulo em `__tests__`. Não duplicar regras do contexto nos componentes.

Os testes de página usam React Testing Library, `userEvent` e o `LibraryProvider` real em jsdom. O setup compartilhado fica em `src/test-setup.ts`.
## Fase 4 - circulacao

`Loan` concentra o historico do emprestimo e a invariante de devolucao unica. `LoanService` orquestra leitor, livro e exemplar por `ILoanRepository`. O repositorio usa transacao EF Core e indice unico filtrado por exemplar.

Nao foi criada entidade de movimentacao separada: o frontend deriva os eventos de emprestimo e devolucao do proprio `Loan`.
