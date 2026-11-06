# Decisões arquiteturais

## 2026-11-06 — .NET 8 e catálogo inicial

Escolhido .NET 8 LTS disponível. O backend inicia por livros/exemplares, mantendo frontend e localStorage independentes; persistência fica isolada em Infrastructure.

## 2026-11-06 — SQLite como provider de desenvolvimento

Como Docker/PostgreSQL não estão disponíveis, SQLite foi escolhido apenas para desenvolvimento e testes. A seleção ocorre por `Database:Provider`; PostgreSQL e sua migration permanecem preservados para o ambiente definitivo.

## 2026-11-06 — Plano funcional separado dos testes automatizados

Foi criado `docs/BLACK_BOX_TEST_PLAN.md` com casos baseados em comportamentos observáveis. Os casos planejados não recebem aprovação por causa dos 21 testes Jest; a execução automatizada existente é registrada apenas na matriz de rastreabilidade.

## 2026-11-04 — Testes sem duplicação de regras

As regras puras permanecem testadas diretamente em `domain/`; os fluxos que combinam estado, persistência e regras são exercitados pelo `LibraryContext` real em jsdom. Isso evita mocks que escondam regressões e não exige reescrever a aplicação.

## 2026-11-04 — Memória no repositório

O contexto persistente usa Markdown versionado em `docs/ai/`, com `AGENTS.md` como entrada. A documentação registra apenas fatos verificados e aponta o código atual como fonte de verdade.

## 2026-11-04 — Integração de páginas com Testing Library

As páginas reais são renderizadas sob `LibraryProvider` e exercitadas com `userEvent`; regras e persistência não são substituídas por mocks.
