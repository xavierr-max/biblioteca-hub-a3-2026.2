# Changelog do Codex

## Fase 3 — gestão de leitores

Implementados entidade Reader, validações, DTOs, serviço, repositório, configuração EF, endpoints HTTP e migration PostgreSQL `AddReaders`. Adicionados testes unitários e de integração SQLite. Frontend não foi alterado.

## Fase 2 — resultados finais

Os testes HTTP foram executados com 6 aprovações. A validação completa do backend passou; a expansão do projeto de integração permanece não commitada para revisão, conforme solicitado.

## Fase 2 — testes de integração HTTP

Adicionado o projeto `Biblioteca.IntegrationTests`, com banco SQLite isolado por caso e cobertura dos endpoints de livros. Corrigido o rastreamento de exemplares no repositório para evitar concorrência falsa no SQLite; nenhuma rota ou contrato foi alterado.

## 2026-11-06 — Backend ASP.NET Core Fase 1

Criada solução .NET 8 em `backend/`, com catálogo de livros/exemplares, EF Core/Npgsql, migration inicial, endpoints REST e 6 testes xUnit aprovados. Criado `docs/BACKEND_GUIDE.md`.

## 2026-11-06 — SQLite sem Docker

Adicionado provider SQLite 8.0.10, seleção configurável mantendo Npgsql, banco de desenvolvimento `biblioteca.dev.db` ignorado pelo Git e testes de integração com `WebApplicationFactory`/SQLite em memória. Validados restore, build, 10 testes xUnit e execução real da API.

## 2026-11-06 — Refatoração estrutural do backend

Separados arquivos e responsabilidades do domínio, aplicação, persistência e API. Contratos, endpoints, regras e migrations foram preservados. Adicionado `.editorconfig` do backend.

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
## 2026-11-06 - Fase 4

- Implementado ciclo de emprestimos e devolucoes no backend, com entidade, DTOs, servico, repositorio, endpoints e migration `AddLoans`.
- Adicionados testes unitarios e HTTP com SQLite.
- Nenhum commit, push ou alteracao no frontend foi realizado.
