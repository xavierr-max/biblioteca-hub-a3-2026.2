# Memória da aplicação

## Estado atual

- Projeto: sistema de gestão de biblioteca.
- Backend: ASP.NET Core 10, API REST, MySQL 8.4 em Docker.
- Frontend: React + TypeScript + Vite, tema escuro com acentos laranja.
- Entidades principais: livros, leitores, exemplares e empréstimos.
- CRUD REST disponível para as quatro entidades.
- Dashboard e telas de gestão consomem dados exclusivamente da API.
- A aba ativa é preservada após F5.
- Cards são a visualização padrão das telas de gestão; lista é opcional.
- Relatórios foi removido da sidebar.
- Edição e confirmação de exclusão devem usar modais da aplicação; nunca usar `alert`, `confirm` ou `prompt` nativos.

## Decisões e convenções

- Não inserir mocks ou dados fictícios no frontend.
- Após qualquer mutação, recarregar os dados relacionados da API.
- Respeitar as regras de integridade do domínio para exclusões.
- Manter o design visual consistente com o dashboard existente.
- Validar backend, frontend e testes antes de publicar.

## Histórico recente

- Implementado CRUD REST completo.
- Removida a aba de Relatórios.
- Adicionada alternância Cards/Lista.
- Substituídos diálogos nativos por modais próprios.
- Modo Lista padronizado com colunas alinhadas para identificação, detalhe, status e ações.
