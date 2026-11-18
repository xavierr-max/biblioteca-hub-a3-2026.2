# Relatório Final - Sistema de Gestão de Biblioteca

## 1. Identificação

- Projeto: Biblioteca Hub A3
- Disciplina: Banco de Dados e Testes de Software
- Integrantes:
  - Maxwell de Araújo Xavier
  - Isabel Schinaiden dos Santos Barbosa
  - Thales José Teixeira Paulo
  - Pedro Henrique Marques
- Data: 18/11/2026

## 2. Cenário e problema

Bibliotecas precisam controlar o acervo, seus exemplares físicos, leitores e movimentações de empréstimo. O projeto centraliza esses registros em um banco MySQL e oferece uma API REST consumida por uma interface React/TypeScript.

O sistema evita registros duplicados, controla disponibilidade de exemplares, impede empréstimos incompatíveis com as regras do domínio e preserva o histórico de empréstimos.

## 3. Regras de negócio principais

- Livro possui título, ISBN-13, categoria, editora e autor(es).
- ISBN e código de inventário são únicos.
- Exemplar pode estar disponível, emprestado, em manutenção ou perdido.
- Leitor suspenso não pode realizar empréstimos.
- Leitor pode possuir no máximo três empréstimos ativos.
- Exemplar emprestado não pode ser emprestado novamente.
- Empréstimo possui prazo padrão de 14 dias.
- Empréstimo só pode ser devolvido uma vez.
- Livro pode possuir vários autores e gêneros.
- Leitor não pode manter reserva ativa duplicada para o mesmo livro.
- Cada empréstimo pode gerar no máximo uma multa.
- Operações de empréstimo e devolução usam transações.

## 4. Modelagem

As entidades de domínio são Categories, Books, Authors, Copies, Readers, Loans, Publishers, Genres, Reservations e Fines. Os relacionamentos N:N entre livros e autores e entre livros e gêneros usam as tabelas associativas BookAuthors e BookGenres.

Relacionamentos principais:

- Categoria 1:N Livro
- Editora 1:N Livro
- Livro N:N Autor
- Livro N:N Gênero
- Livro 1:N Exemplar
- Leitor 1:N Empréstimo
- Exemplar 1:N Empréstimo histórico
- Leitor 1:N Reserva
- Livro 1:N Reserva
- Empréstimo 1:0..1 Multa

## 5. Implementação

- Banco: MySQL 8.4 em Docker Compose
- Backend: ASP.NET Core 10, Entity Framework Core e API REST
- Frontend: React, TypeScript e Vite
- Testes: xUnit, integração HTTP e cobertura Coverlet
- Persistência: schema SQL, seed demonstrativo e migration `A3Expansion`

A aplicação possui dashboard, gerenciamento de livros, leitores, exemplares, empréstimos, categorias, autores, editoras, gêneros, reservas e multas.

## 6. Dados de demonstração

O banco foi populado com livros, autores, categorias, editoras, gêneros, exemplares e leitores. Também há exemplos de empréstimo atrasado, reserva ativa e multa em aberto para permitir consultas e demonstrações variadas.

## 7. Testes realizados

### Caixa branca

Foram executados 14 testes backend, todos aprovados. Os cenários cobrem leitor suspenso, limite de empréstimos, disponibilidade de exemplar, valores-limite e mensagens de decisão.

### Caixa preta

Foram validados endpoints de saúde, catálogo, editoras, reservas e multas. Também foram testados ISBN duplicado, leitor suspenso, exemplar indisponível, empréstimo válido, devolução repetida, reserva duplicada, multa inválida e multa duplicada.

### Cobertura

A primeira medição registrou 5,04% de linhas e 3,14% de branches. O resultado mostra que a suíte unitária cobre o domínio, mas ainda precisa de mais testes de API e interface para ampliar a cobertura.

## 8. Consultas SQL demonstráveis

O arquivo `database/scripts/02-demo-queries.sql` contém consultas com JOIN, LEFT JOIN, GROUP BY, HAVING, CASE, GROUP_CONCAT, filtros e ordenação. Elas demonstram o acervo completo, empréstimos ativos por leitor e multas em aberto.

## 9. Execução

O arquivo `iniciar-biblioteca.cmd` inicia o MySQL, a API, o frontend e abre o navegador. O arquivo `parar-biblioteca.cmd` encerra os processos da aplicação preservando o banco e seu volume Docker.

## 10. Conclusão e limitações

O projeto entrega uma aplicação conectada ao MySQL, com modelagem relacional, operações CRUD, regras de empréstimo, dados demonstrativos, migration e evidências de testes.

Como melhoria futura, a aplicação pode ampliar a cobertura de testes, adicionar autenticação, permitir edição completa das novas entidades e incluir relatórios operacionais.
