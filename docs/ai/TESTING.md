# Testes

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
