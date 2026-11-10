# Testes

## Fase 3 — resultados

- Unitários backend: 16 aprovados, incluindo entidade, campos obrigatórios, contatos e status de leitores.
- Integração HTTP backend: 10 aprovados, incluindo os 6 casos de livros e 4 casos de leitores com SQLite isolado.
- `dotnet restore`, `dotnet build`, `dotnet test` e `dotnet format --verify-no-changes --no-restore`: aprovados.
- Frontend: 5 suítes/21 testes Jest aprovados, TypeScript aprovado e build Vite aprovado.

## Fase 2 — resultados finais

- `dotnet restore`: aprovado.
- `dotnet build`: aprovado, 0 erros/avisos.
- `dotnet test`: 10 testes unitários e 6 testes de integração aprovados.
- `dotnet format --verify-no-changes --no-restore`: aprovado.
- Frontend: 5 suítes/21 testes Jest aprovados, TypeScript aprovado e build Vite aprovado.

## Fase 2 — integração HTTP

Criado `backend/tests/Biblioteca.IntegrationTests` com xUnit, `WebApplicationFactory` e SQLite em memória isolado por teste. Os 6 casos exercitam lista vazia/com dados, consulta existente/inexistente, cadastro válido/inválido/duplicado, atualização, restrições de cópias e arquivamento.

## 2026-11-06 — Refatoração estrutural

Após a reorganização dos arquivos e namespaces, `dotnet restore`, `dotnet build`, `dotnet test` e `dotnet format --verify-no-changes --no-restore` foram executados com sucesso. A suíte backend permanece com 10 testes aprovados.

## Backend — 2026-11-06

`dotnet restore`, `dotnet build` e `dotnet test` aprovados. A suíte agora tem 10 testes xUnit, incluindo 4 testes HTTP com `WebApplicationFactory` e SQLite em memória, cobrindo cadastro, ISBN, consulta, atualização, arquivamento e persistência no contexto real. A API foi executada com SQLite em arquivo e os endpoints foram exercitados; dados permaneceram após reinício. PostgreSQL não foi conectado/aplicado.

## Atualização — 2026-11-06 — Execução do plano de caixa preta

- Executados por interface RTL: CT-LIV-005, CT-LEI-001, CT-LEI-002, CT-EMP-001, CT-DEV-001 e CT-HIS-001; os 6 foram aprovados.
- Permanecem 17 casos não executados; nenhum caso foi reclassificado como reprovado ou bloqueado.
- `corepack pnpm@10 test`: 5 suítes e 21 testes aprovados, 0 falhas.
- `corepack pnpm@10 test:coverage`: aprovado; 72,54% statements, 57,30% branches, 75,55% functions e 73,68% lines.
- `corepack pnpm@10 exec tsc --noEmit`: aprovado.
- `corepack pnpm@10 build`: aprovado; 1.980 módulos transformados.
- Evidências detalhadas: `docs/BLACK_BOX_TEST_EXECUTION.md`.

## Atualização — 2026-11-06

- Criado `docs/BLACK_BOX_TEST_PLAN.md` com 23 casos: 7 de livros/acervo, 4 de leitores, 4 de empréstimos, 3 de devoluções, 2 de histórico e 3 de relatórios.
- Nenhum caso manual foi executado nesta tarefa: 0 executados, 0 aprovados e 23 não executados no plano.
- Os 21 testes Jest continuam sendo evidência automatizada separada e foram associados somente quando o arquivo e o nome real foram confirmados.
- A análise atual confirmou o formulário e as ações de livros na `BooksPage`; a limitação antiga sobre ausência de formulário está obsoleta.

Documentação didática completa: `docs/TESTING_GUIDE.md`. Resumo para apresentação: `docs/TESTING_PRESENTATION.md`.

Validação pré-commit mais recente: 5 suítes e 21 testes aprovados; TypeScript e build de produção aprovados.

A suíte de páginas usa timeout explícito de 10 segundos porque combina várias interações assíncronas de `userEvent`; isso foi ajustado sem alterar regras de negócio.

## Atualização — 2026-11-04

- Configurados React Testing Library 16, `@testing-library/jest-dom` 7 e user-event 14.
- Resultado atual: 5 suítes e 21 testes aprovados, 0 falhas.
- Cobertura atual: 72,54% statements, 57,30% branches, 75,55% functions e 73,68% lines.
- `LibraryContext.tsx`: 70,41% statements e 52,00% branches; `domain/`: 83,72% statements e 77,02% branches.
- TypeScript e build Vite aprovados.
- Os testes de página cobrem os fluxos principais, mas a `BooksPage` não renderiza atualmente um drawer de cadastro/edição/exclusão; esses fluxos seguem cobertos no contexto.

## Ferramentas e comandos

- Jest 30 + ts-jest 29 + `jest-environment-jsdom`.
- `corepack pnpm@10 test`
- `corepack pnpm@10 test:coverage`
- `corepack pnpm@10 exec tsc --noEmit`
- `corepack pnpm@10 build`

## Organização

- `src/context/__tests__/validation.test.ts`: validadores puros.
- `src/context/__tests__/LibraryContext.integration.test.tsx`: fluxo integrado do provider, persistência e mutações.
- `src/domain/__tests__/returnRules.test.ts`: validação/aplicação de devoluções.
- `src/domain/__tests__/reporting.test.ts`: status, histórico, CSV e períodos.
- `src/pages/__tests__/pages.integration.test.tsx`: interação das páginas de livros, leitores, empréstimos e devoluções.

## Última execução — 2026-11-04

- Jest: 5 suítes aprovadas, 21 testes aprovados, 0 falhas.
- Cobertura geral: 72,54% statements, 57,30% branches, 75,55% functions, 73,68% lines.
- `LibraryContext.tsx`: 70,41% statements, 52,00% branches, 72,41% functions, 71,53% lines.
- `domain/`: 83,72% statements, 77,02% branches, 94,73% functions, 84,61% lines.
- `returnRules.ts`: 81,25% statements e 79,54% branches.
- `reporting.ts`: 86,84% statements e 73,33% branches.
- TypeScript (`tsc --noEmit`): aprovado.
- Build Vite de produção: aprovado.

O Jest emite apenas o aviso TS151001 do ts-jest sobre `esModuleInterop`; não impede a execução nem a compilação.

## Lacunas

Os testes de página cobrem os fluxos principais, mas não todos os caminhos de edição/exclusão visual. A `BooksPage` atualmente não renderiza um drawer de cadastro/edição/exclusão; esses fluxos seguem cobertos no contexto. Permanecem ramos menos frequentes sem cobertura total.
## Fase 4 - resultados atuais (2026-11-06)

- `dotnet restore backend/Biblioteca.sln`: aprovado.
- `dotnet build backend/Biblioteca.sln`: aprovado, 0 erros e 0 avisos.
- Unitarios backend: 19 aprovados.
- Integracao HTTP: 13 aprovados com SQLite em memoria isolado por `ApiFactory`.
- Os testes cobrem cadastro, elegibilidade, datas, disponibilidade, devolucao unica, historico e persistencia.
- `AddLoans` foi gerada com provider PostgreSQL; PostgreSQL nao foi conectado neste ambiente.

## Fase 5.1 - resultados atuais

- Testes Jest: 6 suites e 25 testes aprovados, incluindo `src/services/__tests__/bookService.test.ts`.
- Os novos testes cobrem consulta, cadastro, erro HTTP e falha de conexao com `fetch` simulado.
- TypeScript e build Vite aprovados apos a integracao do cliente HTTP.
- Nenhum teste frontend usa a API real.
## 2026-11-10 — Validação da preparação MySQL

- `dotnet restore backend/Biblioteca.sln --disable-parallel`: aprovado, incluindo Pomelo MySQL 8.0.2.
- `dotnet build backend/Biblioteca.sln --no-restore -p:UseSharedCompilation=false`: aprovado, 0 erros e 0 avisos.
- `dotnet test backend/Biblioteca.sln --no-build -p:UseSharedCompilation=false`: interrompido por erro interno do CLR no runner; não registrar como suíte aprovada.
- Docker está instalado, mas o daemon não está acessível; não houve teste de conexão nem aplicação de migration MySQL.

## 2026-11-10 — Atualização .NET 10/npm

- SDK disponível: .NET 10.0.114.
- Build/teste após a atualização de target e pacotes ainda pendentes; o restore deve ser executado com registry NuGet acessível.
- npm não gerou o lockfile nesta sessão porque `npm install --package-lock-only --ignore-scripts` ficou sem resposta; não declarar validação frontend como aprovada.

## 2026-11-10 — MySQL local

- Container `biblioteca-mysql` MySQL 8.4.13: saudável.
- Conexão com o usuário `biblioteca` e banco `biblioteca`: aprovada.
- API .NET 10 iniciou com `Database__Provider=MySql` e criou as tabelas `Books`, `Copies`, `Readers` e `Loans` via `EnsureCreated`.
- As migrations PostgreSQL não foram aplicadas ao MySQL; a incompatibilidade de tipos foi confirmada e permanece registrada para a geração de migrations MySQL separadas.
