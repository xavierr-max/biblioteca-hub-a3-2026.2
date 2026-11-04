# Changelog do Codex

## 2026-11-04

- Revalidação pré-commit: 5 suítes e 21 testes aprovados, TypeScript aprovado e build de produção aprovado. Arquivos gerados e sensíveis foram excluídos da seleção do commit.

- Criada a memória persistente versionada em `AGENTS.md` e `docs/ai/`.
- Ampliada a suíte com integração do `LibraryContext`, cobrindo CRUD de livros, leitores, empréstimos, devoluções, disponibilidade e persistência.
- Configurado o Jest para descobrir testes `.ts` e `.tsx` e o ambiente React 19 `act`.
- Verificados Jest, cobertura, TypeScript e build; 17 testes passaram e a cobertura geral foi 72,54%.
- Instalados React Testing Library, jest-dom e user-event; 5 suítes e 21 testes passaram, com TypeScript e build aprovados.
