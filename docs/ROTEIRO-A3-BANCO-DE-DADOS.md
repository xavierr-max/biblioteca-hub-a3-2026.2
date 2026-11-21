# Roteiro de apresentação A3 — Biblioteca Hub

## Base da avaliação

Este roteiro foi elaborado a partir das **Diretrizes da Avaliação A3.pdf** e dos documentos do projeto. A apresentação deve provar domínio de Banco de Dados, não apenas mostrar uma aplicação funcionando.

Distribuição da nota: modelagem e coerência do banco (12 pontos); aplicação conectada ao banco (10); consultas SQL (9); apresentação e domínio (6); organização técnica (3).

## Ordem obrigatória

1. Cenário e regras de negócio.
2. Entidades, atributos, chaves e relações.
3. Aplicação conectada ao MySQL: CREATE, READ, UPDATE e DELETE.
4. DER/diagrama, relacionando-o ao que foi implementado.
5. Banco no MySQL: tabelas, chaves, relacionamentos e dados.
6. Três consultas SQL escritas ao vivo.

## 1. Cenário — Maxwell

Fala sugerida:

> O Biblioteca Hub é um sistema de gestão de biblioteca. O problema é que o controle manual dificulta saber quais exemplares estão disponíveis, quais leitores têm empréstimos ativos e quais devoluções estão atrasadas. A solução centraliza catálogo, exemplares, leitores, empréstimos, reservas e multas em um banco MySQL, acessado por uma aplicação web.

O usuário principal é a bibliotecária. O sistema registra livros, exemplares físicos, leitores e os eventos de empréstimo, devolução, reserva e multa.

Regras a destacar:

- ISBN-13, matrícula e código de inventário são únicos;
- livro pode ter vários autores e gêneros;
- exemplar pode estar disponível, emprestado, em manutenção ou perdido;
- leitor suspenso não pode emprestar;
- limite de três empréstimos ativos por leitor;
- exemplar emprestado não pode ser emprestado novamente;
- prazo padrão de 14 dias;
- devolução só pode ocorrer uma vez;
- reserva ativa duplicada é rejeitada;
- cada empréstimo pode ter no máximo uma multa.

## 2. Entidades e relações — Isabel

Entidades significativas: `Categories`, `Books`, `Authors`, `Copies`, `Readers`, `Loans`, `Publishers`, `Genres`, `Reservations` e `Fines`.

Justificativas rápidas:

- `Books` representa a obra; `Copies`, cada exemplar físico.
- `Authors` e `Genres` classificam livros.
- `Readers` representa quem realiza empréstimos e reservas.
- `Loans` preserva o histórico de circulação.
- `Reservations` e `Fines` representam operações que não caberiam corretamente em `Loans`.

Relacionamentos:

- Category 1:N Book;
- Publisher 1:N Book;
- Book 1:N Copy;
- Book N:N Author por `BookAuthors`;
- Book N:N Genre por `BookGenres`;
- Reader 1:N Loan;
- Copy 1:N Loan no histórico;
- Reader 1:N Reservation e Book 1:N Reservation;
- Loan 1:0..1 Fine.

Explique sempre a cardinalidade: por exemplo, um leitor pode ter zero ou muitos empréstimos; cada empréstimo pertence obrigatoriamente a um leitor e a um exemplar.

## 3. Aplicação e CRUD — Thales

Arquitetura:

```text
React + TypeScript + Vite
        -> API REST ASP.NET Core 10
        -> Entity Framework Core
        -> MySQL 8.4 em Docker
```

Demonstração obrigatória:

1. **CREATE:** cadastrar autor ou gênero e confirmar o registro no MySQL.
2. **READ:** consultar registros já persistidos na aplicação e no banco.
3. **UPDATE:** alterar o nome e consultar novamente para provar a persistência.
4. **DELETE:** excluir um registro seguro e confirmar que ele desapareceu.

Depois, mostrar o fluxo de domínio: cadastrar livro, cadastrar exemplar, registrar empréstimo, mostrar o exemplar como emprestado e realizar a devolução. Use a aplicação para operar, mas valide o resultado no banco.

## 4. DER e modelo lógico

Abrir `DER.pdf`/`DER.svg` e, se possível, o diagrama no MySQL Workbench. Apontar:

- chave primária de cada entidade;
- chaves estrangeiras;
- tabelas associativas `BookAuthors` e `BookGenres`;
- cardinalidades;
- unicidades e restrições;
- correspondência entre o DER e o schema implementado.

O professor alerta que o diagrama precisa refletir exatamente o banco real. Não apresentar um DER diferente das tabelas existentes.

## 5. Banco no MySQL — Pedro

Mostrar o banco `biblioteca` e as tabelas. Explicar que:

- `database/scripts/01-schema.sql` cria a estrutura;
- `database/seeds/01-demo-data.sql` povoa dados de demonstração;
- `database/scripts/03-a3-expansion.sql` adiciona editoras, gêneros, reservas e multas;
- migrations do EF Core registram a evolução do schema;
- PKs identificam registros; FKs mantêm relacionamentos;
- constraints e índices evitam inconsistências e aceleram consultas.

O povoamento precisa ser variado, não apenas um registro por tabela. O seed atual permite demonstrar empréstimo atrasado, reserva ativa e multa em aberto.

## 6. Desafio SQL ao vivo

O professor pode solicitar três necessidades de consulta diferentes. Treinem escrever do zero, usando as próprias tabelas:

1. acervo completo com livro, categoria, editora, autores, gêneros e quantidade de exemplares;
2. empréstimos ativos por leitor, com prazo e situação;
3. multas em aberto relacionadas ao leitor, empréstimo e livro.

Recursos exigidos nas diretrizes: `SELECT`, `WHERE`, operadores lógicos e relacionais, `ORDER BY`, `LIKE`, agregações, `GROUP BY`, `HAVING` e `JOIN` entre duas ou mais tabelas.

Modelo mental: identificar a pergunta; escolher a tabela principal; definir joins; filtrar; agrupar se necessário; ordenar; interpretar o resultado.

Arquivo de treino: `database/scripts/02-demo-queries.sql`. Não decorem apenas as consultas prontas.

## 7. Perguntas prováveis

**Por que separar livro e exemplar?** Livro é a obra; exemplar é a unidade física que pode ser emprestada ou entrar em manutenção.

**Por que usar tabelas associativas?** Porque livro-autor e livro-gênero são relações muitos-para-muitos.

**Onde estão as regras?** Em `LoanRules`, na API e nas restrições do banco.

**Por que usar transação?** Para atualizar empréstimo e status do exemplar como uma operação única.

**Por que não apagar livro emprestado?** Para preservar consistência e histórico; a API bloqueia a operação.

**Por que não há login?** O escopo é uma ferramenta local para a bibliotecária; autenticação ficou como evolução.

## 8. Mapa dos documentos do projeto

- `docs/OBJETIVOS-DO-PROJETO.md`: objetivo, escopo e critérios.
- `docs/MEMORIA-DA-APLICACAO.md`: estado atual, decisões e limitações.
- `docs/RELATORIO-FINAL-A3.md`: narrativa formal, regras, modelo, implementação e testes.
- `docs/PITCH-ROTEIRO-A3.md`: sequência de slides.
- `docs/ROTEIRO-APRESENTACAO-A3-4-INTEGRANTES.md`: divisão das falas.
- `docs/banco-de-dados/modelo-logico.md`: entidades, atributos e relações.
- `docs/banco-de-dados/regras-de-negocio.md`: regras do domínio.
- `database/scripts/01-schema.sql`: implementação física.
- `database/seeds/01-demo-data.sql`: dados de demonstração.
- `database/scripts/02-demo-queries.sql`: consultas para treinamento.
- `database/scripts/03-a3-expansion.sql`: expansão do banco.
- `DER.pdf`, `DER.svg`, `DER.mmd`: diagrama.
- `backend/Biblioteca.Domain/Entities.cs`: entidades.
- `backend/Biblioteca.Domain/LoanRules.cs`: regras de empréstimo.
- `backend/Biblioteca.Infrastructure/LibraryDbContext.cs`: mapeamento para o banco.
- `backend/Biblioteca.Api/Program.cs`: endpoints e transações.
- `frontend/src/App.tsx` e `frontend/src/services/api.ts`: interface e consumo da API.
- `compose.yaml`, `.env.example` e `iniciar-biblioteca.cmd`: execução.
- `tests/evidencias/api-black-box-2026-11-18.md`: evidências.
- `Biblioteca-Hub-A3-editavel.pptx`: apresentação visual.

## 9. Checklist final

- [ ] Todos sabem explicar as dez entidades e por que existem.
- [ ] PKs, FKs, tipos, restrições e cardinalidades foram revisados.
- [ ] DER, banco e aplicação estão coerentes.
- [ ] MySQL inicia na máquina da apresentação.
- [ ] Há dados variados para consultas.
- [ ] CREATE, READ, UPDATE e DELETE foram ensaiados com confirmação no banco.
- [ ] Três consultas são escritas do zero durante o ensaio.
- [ ] Todos conhecem `JOIN`, `WHERE`, `GROUP BY`, `HAVING`, `LIKE` e agregações.
- [ ] PPTX, scripts, código e diagramas estão acessíveis.
- [ ] Cada integrante consegue responder perguntas fora da própria parte.

## 10. O que evitar

- Criar entidades artificiais apenas para alcançar dez.
- Apresentar DER diferente do banco.
- Demonstrar telas sem provar persistência.
- Usar dados insuficientes para consultas.
- Decorar somente as consultas prontas.
- Deixar apenas um integrante explicar o projeto.
- Esconder limitações ou afirmar resultados que não foram verificados.
