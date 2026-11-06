# Changelog do Codex

## 2026-11-06 — Execução do plano de caixa preta

- Executados 6 dos 23 casos por testes de interface reais com React Testing Library e `user-event`; os 6 foram aprovados.
- Criado `docs/BLACK_BOX_TEST_EXECUTION.md` com método, data, evidências e limitações observadas.
- A suíte completa passou com 5 suítes/21 testes; cobertura, TypeScript e build também foram aprovados.
- Os 17 casos restantes permanecem não executados; nenhum resultado foi presumido.

## 2026-11-06

- Criado `docs/BLACK_BOX_TEST_PLAN.md` com 23 casos funcionais de caixa preta, técnicas, rastreabilidade, resumo e roteiro de apresentação.
- Atualizado `AGENTS.md` para exigir manutenção contínua do plano e dos resultados reais.
- Confirmado no código atual que `BooksPage` possui cadastro/edição/exclusão/arquivamento e gestão de exemplares.
- Nenhum caso foi marcado como aprovado; não houve execução manual nesta tarefa.

## 2026-11-04

- Validação pré-commit dos guias de testes: 21 testes aprovados, TypeScript aprovado e build de produção aprovado.
- Criados `docs/TESTING_GUIDE.md` e `docs/TESTING_PRESENTATION.md`, documentando os 21 testes atuais, sua arquitetura, execução, cobertura, limitações e roteiro de apresentação.
- Ajustado o timeout da suíte de páginas para evitar falso negativo sob carga e alinhado o nome do caso de leitores ao comportamento realmente verificado.
- Revalidação pré-commit: 5 suítes e 21 testes aprovados, TypeScript aprovado e build de produção aprovado. Arquivos gerados e sensíveis foram excluídos da seleção do commit.

- Criada a memória persistente versionada em `AGENTS.md` e `docs/ai/`.
- Ampliada a suíte com integração do `LibraryContext`, cobrindo CRUD de livros, leitores, empréstimos, devoluções, disponibilidade e persistência.
- Configurado o Jest para descobrir testes `.ts` e `.tsx` e o ambiente React 19 `act`.
- Verificados Jest, cobertura, TypeScript e build; 17 testes passaram e a cobertura geral foi 72,54%.
- Instalados React Testing Library, jest-dom e user-event; 5 suítes e 21 testes passaram, com TypeScript e build aprovados.
