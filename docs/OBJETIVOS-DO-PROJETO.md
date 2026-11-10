# Objetivos do projeto

## Objetivo geral

Entregar um sistema de gestão de biblioteca demonstrável, com dados persistidos em MySQL, API REST, frontend React/TypeScript e base preparada para autenticação, autorização e testes.

## Objetivos funcionais

- Gerenciar livros, leitores, exemplares e empréstimos.
- Registrar empréstimos e devoluções respeitando as regras de negócio.
- Permitir consulta, criação, edição e exclusão por API REST.
- Oferecer uma experiência clara para a bibliotecária.
- Evitar dados de demonstração desacoplados do backend.

## Próximos objetivos

1. Implementar autenticação segura.
2. Implementar autorização por perfis: Administrador, Bibliotecário e Leitor.
3. Substituir identificadores manuais nos formulários por seleções carregadas da API.
4. Ampliar testes de caixa preta, caixa branca e testes de interface.
5. Documentar endpoints e fluxos principais.

## Critérios de qualidade

- Build sem warnings.
- Testes automatizados aprovados.
- Sem `alert`, `confirm` ou `prompt` nativos.
- Sem mocks no frontend.
- Alterações publicadas somente após validação.
