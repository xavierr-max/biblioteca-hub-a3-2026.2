# Roteiro do pitch - Biblioteca Hub A3

## Slide 1 - Projeto

Sistema de Gestão de Biblioteca

Integrantes:

- Maxwell de Araújo Xavier
- Isabel Schinaiden dos Santos Barbosa
- Thales José Teixeira Paulo
- Pedro Henrique Marques

## Slide 2 - Problema

O controle manual dificulta saber quais exemplares estão disponíveis, quais leitores estão com empréstimos ativos e quais devoluções estão atrasadas.

## Slide 3 - Solução

Uma aplicação web conectada ao MySQL para controlar catálogo, exemplares, leitores, empréstimos, reservas e multas.

## Slide 4 - Entidades

Categories, Books, Authors, Copies, Readers, Loans, Publishers, Genres, Reservations e Fines.

Destacar que BookAuthors e BookGenres resolvem relacionamentos muitos-para-muitos.

## Slide 5 - Regras de negócio

Mostrar o limite de três empréstimos ativos, a suspensão de leitores, a disponibilidade do exemplar, o prazo de 14 dias, a devolução única e as regras de reservas e multas.

## Slide 6 - DER e banco

Abrir o diagrama e o DBeaver. Mostrar chaves primárias, estrangeiras, índices, unicidade e tabelas populadas.

## Slide 7 - Demonstração da aplicação

1. Abrir `iniciar-biblioteca.cmd`.
2. Mostrar dashboard com dados vindos da API.
3. Cadastrar um livro com categoria, editora, gênero e autor.
4. Cadastrar um exemplar.
5. Registrar um empréstimo.
6. Devolver o exemplar.
7. Mostrar uma reserva e uma multa.

## Slide 8 - Testes

Apresentar os 14 testes unitários aprovados e os cenários de caixa preta: leitor suspenso, exemplar indisponível, ISBN duplicado, devolução repetida, reserva duplicada e multa duplicada.

## Slide 9 - Consultas SQL

Executar três consultas do arquivo `database/scripts/02-demo-queries.sql` e explicar os JOINs, agrupamentos e filtros utilizados.

## Slide 10 - Encerramento

Retomar a solução: dados persistidos no MySQL, regras protegendo a operação e aplicação demonstrável de ponta a ponta.
