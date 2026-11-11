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

1. Substituir identificadores manuais nos formulários por seleções carregadas da API.
2. Ampliar testes de caixa preta, caixa branca e testes de interface.
3. Documentar endpoints e fluxos principais.

## Decisão de acesso

A aplicação é uma ferramenta local de gestão para a bibliotecária. Não exige login, cadastro de usuário, autenticação ou perfis de acesso. Os dados de identificação da bibliotecária são preferências locais para personalizar a interface.

## Critérios de qualidade

- Build sem warnings.
- Testes automatizados aprovados.
- Sem `alert`, `confirm` ou `prompt` nativos.
- Sem mocks no frontend.
- Alterações publicadas somente após validação.
