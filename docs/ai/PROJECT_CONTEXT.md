# Contexto do projeto

## Objetivo

BibliotecaHub é uma aplicação frontend para administrar livros, exemplares físicos, leitores, empréstimos, devoluções e relatórios.

## Tecnologias

- React 19, Vite 8 e TypeScript 5.7.
- Jest 30 com ts-jest 29, ambiente jsdom e React Testing Library 16 com user-event.
- npm é o gerenciador do frontend; o lockfile versionado é `frontend/package-lock.json`.

## Funcionalidades existentes

Cadastro/edição/arquivamento de livros, gestão de exemplares, cadastro de leitores, empréstimos, devoluções, dashboards e relatórios CSV. O estado é mantido pelo `LibraryProvider` e persistido no `localStorage`.

## Estado atual

Há testes unitários de domínio, integração do `LibraryContext` e interação das páginas principais. A suíte atual passou com 21 testes em 5 suítes; a cobertura real está registrada em `TESTING.md`.

## Limitações conhecidas

O projeto não possui backend de aplicação neste frontend: os dados são prototipais e persistidos localmente. A tela de livros expõe listagem/pesquisa, mas o código atual não renderiza um formulário de cadastro apesar de o contexto possuir a operação `addBook`; isso permanece como lacuna funcional a confirmar antes de implementar.
