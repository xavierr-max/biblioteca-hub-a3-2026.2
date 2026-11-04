# Decisões arquiteturais

## 2026-11-04 — Testes sem duplicação de regras

As regras puras permanecem testadas diretamente em `domain/`; os fluxos que combinam estado, persistência e regras são exercitados pelo `LibraryContext` real em jsdom. Isso evita mocks que escondam regressões e não exige reescrever a aplicação.

## 2026-11-04 — Memória no repositório

O contexto persistente usa Markdown versionado em `docs/ai/`, com `AGENTS.md` como entrada. A documentação registra apenas fatos verificados e aponta o código atual como fonte de verdade.

## 2026-11-04 — Integração de páginas com Testing Library

As páginas reais são renderizadas sob `LibraryProvider` e exercitadas com `userEvent`; regras e persistência não são substituídas por mocks.
