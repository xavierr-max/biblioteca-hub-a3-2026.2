# Roteiro de apresentação A3 - Biblioteca Hub

## Objetivo da apresentação

Demonstrar que o grupo compreende o cenário de uma biblioteca, justificou a modelagem, implementou o banco no MySQL, conectou a aplicação ao banco e consegue escrever três consultas SQL durante a avaliação.

A ordem deve ser mantida:

1. Cenário;
2. Entidades e relações;
3. Aplicação;
4. DER/diagrama;
5. Banco no MySQL;
6. Desafio SQL.

## Divisão dos integrantes

- **Integrante 1 - Maxwell de Araújo Xavier:** cenário, problema, solução e regras de negócio.
- **Integrante 2 - Isabel Schinaiden dos Santos Barbosa:** entidades, atributos, relacionamentos e cardinalidades.
- **Integrante 3 - Thales José Teixeira Paulo:** demonstração da aplicação e operações CRUD.
- **Integrante 4 - Pedro Henrique Marques:** DER, banco MySQL, integridade e consultas SQL ao vivo.

Todos devem conhecer o projeto inteiro, pois o professor pode direcionar perguntas a qualquer integrante.

---

## 1. Abertura e cenário - Integrante 1

**Slide de apoio:** nome do projeto e integrantes.

### Fala sugerida

> Bom dia/boa noite. Nós somos o grupo responsável pelo projeto **Biblioteca Hub**, um sistema de gestão de biblioteca. O grupo é formado por Maxwell de Araújo Xavier, Isabel Schinaiden dos Santos Barbosa, Thales José Teixeira Paulo e Pedro Henrique Marques.
>
> O cenário escolhido é uma biblioteca que precisa controlar seu acervo, os exemplares físicos, os leitores e as movimentações de empréstimo. O problema é que um controle manual dificulta saber quais exemplares estão disponíveis, quais leitores possuem empréstimos ativos e quais devoluções estão atrasadas.
>
> Nossa solução é uma aplicação web conectada a um banco MySQL. Ela permite cadastrar e consultar livros, leitores, exemplares, empréstimos, categorias, autores, editoras, gêneros, reservas e multas.

### Regras de negócio a destacar

- ISBN-13, matrícula do leitor e código do exemplar são únicos.
- Um livro pode ter vários autores e gêneros.
- Um exemplar pode estar disponível, emprestado, em manutenção ou perdido.
- Leitor suspenso não pode realizar empréstimo.
- Cada leitor pode ter no máximo três empréstimos ativos.
- Um exemplar emprestado não pode ser emprestado novamente.
- O prazo padrão do empréstimo é de 14 dias.
- Um empréstimo só pode ser devolvido uma vez.
- Um leitor não pode manter reserva ativa duplicada para o mesmo livro.
- Um empréstimo pode gerar no máximo uma multa.

### Transição

> Com o cenário e as regras definidos, a Isabel vai mostrar como essas necessidades foram transformadas em entidades e relacionamentos.

---

## 2. Entidades e relacionamentos - Integrante 2

**Slide de apoio:** lista de entidades e visão resumida do DER.

### Fala sugerida

> Para representar o cenário, identificamos dez entidades significativas: **Categories, Books, Authors, Copies, Readers, Loans, Publishers, Genres, Reservations e Fines**. Cada uma existe por uma necessidade real do domínio, e não apenas para atingir uma quantidade mínima.

### Explicação das entidades

- **Categories:** classifica os livros.
- **Books:** representa as obras e armazena título, ISBN, categoria e editora.
- **Authors:** armazena os autores.
- **Copies:** representa cada exemplar físico e seu status.
- **Readers:** representa os leitores e sua matrícula.
- **Loans:** registra o histórico de empréstimos e devoluções.
- **Publishers:** armazena as editoras.
- **Genres:** classifica os livros por gênero.
- **Reservations:** registra reservas feitas por leitores.
- **Fines:** registra multas associadas a empréstimos.

### Relacionamentos e cardinalidades principais

> Uma categoria pode possuir zero ou vários livros, mas cada livro pertence obrigatoriamente a uma categoria: **Categories 0..N Books** e **Books 1..1 Categories**.
>
> Um livro possui um ou vários exemplares: **Books 1..N Copies**. Um exemplar pertence a um único livro.
>
> Livros e autores formam um relacionamento muitos-para-muitos, resolvido pela tabela associativa **BookAuthors**. Livros e gêneros também formam um relacionamento muitos-para-muitos, resolvido por **BookGenres**.
>
> Um leitor pode ter vários empréstimos ao longo do tempo, e um exemplar também pode aparecer em vários empréstimos históricos, embora só possa ter um empréstimo ativo por vez.
>
> Uma multa pertence a um empréstimo, e cada empréstimo pode ter zero ou uma multa.

### Pontos técnicos para responder se perguntado

- As tabelas associativas usam chave primária composta pelo par de chaves estrangeiras.
- As chaves estrangeiras impedem relacionamentos com registros inexistentes.
- As restrições `UNIQUE`, `NOT NULL`, `CHECK` e os índices ajudam a preservar a integridade.

### Transição

> Depois de definir a estrutura, o Thales vai demonstrar que a aplicação está conectada ao banco e que as operações realmente persistem os dados.

---

## 3. Aplicação e CRUD - Integrante 3

**Preparação:** executar `iniciar-biblioteca.cmd` antes da apresentação e confirmar que MySQL, API e frontend estão funcionando.

### Fala sugerida

> A aplicação foi desenvolvida com React, TypeScript e Vite no frontend, ASP.NET Core 10 e Entity Framework Core no backend, e MySQL 8.4 em Docker. O frontend não usa dados mockados: os dados exibidos são carregados pela API, que consulta o banco.

### Demonstração obrigatória

Demonstrar as quatro operações exigidas pela avaliação, sempre confirmando que a alteração foi persistida:

1. **CREATE:** cadastrar um livro novo, selecionando categoria, editora, gênero e autor.
2. **READ:** consultar o catálogo e mostrar o livro cadastrado junto dos dados relacionados.
3. **UPDATE:** editar um campo do livro, como título ou categoria, salvar e recarregar a tela.
4. **DELETE:** excluir um registro sem vínculos, como uma reserva ou multa de demonstração, e confirmar que ele desapareceu da consulta.

### Demonstração complementar

> Também podemos mostrar o cadastro de um exemplar e o registro de um empréstimo. Na criação do empréstimo, a API valida se o leitor está suspenso, se não ultrapassou três empréstimos ativos e se o exemplar está disponível. Na devolução, o exemplar volta a ficar disponível e o empréstimo não pode ser devolvido novamente.

### Cuidados durante a demonstração

- Mostrar que o registro foi salvo após atualizar a página.
- Evitar excluir um livro que possua exemplares ou histórico relacionado.
- Se o professor solicitar, abrir o DBeaver/Workbench e confirmar a alteração diretamente no MySQL.

### Transição

> A aplicação acabou de demonstrar os dados em uso. Agora o Pedro vai relacionar essa execução ao DER e mostrar a implementação física no MySQL.

---

## 4. DER e coerência do modelo - Integrante 4

**Slide de apoio:** DER correspondente ao banco implementado.

### Fala sugerida

> Este é o DER do sistema. Ele deve representar exatamente as tabelas que estão implementadas no MySQL. As relações mostram como o cenário foi transformado em uma estrutura relacional.
>
> O ponto importante é a coerência entre o cenário, o diagrama e o banco. Por exemplo, o relacionamento entre livros e autores não fica diretamente em uma única coluna: ele é resolvido pela tabela BookAuthors, porque um livro pode ter vários autores e um autor pode participar de vários livros.
>
> O mesmo raciocínio é aplicado a livros e gêneros por meio de BookGenres. Já empréstimos, reservas e multas representam eventos e consequências do funcionamento da biblioteca.

### Verificação obrigatória antes da apresentação

O arquivo `database/diagrams/der.md` atualmente mostra apenas parte do modelo. Antes da avaliação, substituir o diagrama por uma versão que inclua as dez entidades implementadas e as tabelas associativas **BookAuthors** e **BookGenres**, para que o DER não fique diferente do banco real.

---

## 5. Banco no MySQL - Integrante 4

**Abrir:** MySQL Workbench ou DBeaver conectado a `localhost:3306`, banco `biblioteca`.

### Fala sugerida

> O banco foi implementado em MySQL 8.4. O schema contém as tabelas correspondentes às entidades modeladas, com chaves primárias, chaves estrangeiras, campos obrigatórios, unicidade, checks e índices.
>
> O banco também possui dados de demonstração suficientes para representar diferentes situações: livros e exemplares, leitores ativos e suspensos, empréstimo atrasado, reserva ativa e multa em aberto.

### Mostrar rapidamente

- `SHOW TABLES;` ou a árvore de tabelas;
- uma tabela com chave primária e estrangeira, como `Books`;
- `Copies.Status` e `Loans.ReturnedAt` para explicar disponibilidade e histórico;
- dados relacionados de livros, leitores, empréstimos, reservas e multas.

### Relação com a aplicação

> A aplicação grava e consulta essas mesmas tabelas por meio da API. Por isso, uma alteração feita na interface pode ser conferida diretamente no banco.

---

## 6. Desafio SQL: três consultas ao vivo - Integrante 4

As consultas abaixo são modelos para treinar. Na avaliação, o professor poderá fornecer necessidades diferentes. Elas devem ser digitadas e explicadas no Workbench/DBeaver, usando as tabelas do próprio projeto.

### Consulta 1 - Acervo com autores e gêneros

```sql
SELECT b.Title,
       c.Name AS Category,
       p.Name AS Publisher,
       GROUP_CONCAT(DISTINCT a.Name ORDER BY a.Name SEPARATOR ', ') AS Authors,
       GROUP_CONCAT(DISTINCT g.Name ORDER BY g.Name SEPARATOR ', ') AS Genres
FROM Books b
JOIN Categories c ON c.CategoryId = b.CategoryId
JOIN Publishers p ON p.PublisherId = b.PublisherId
LEFT JOIN BookAuthors ba ON ba.BookId = b.BookId
LEFT JOIN Authors a ON a.AuthorId = ba.AuthorId
LEFT JOIN BookGenres bg ON bg.BookId = b.BookId
LEFT JOIN Genres g ON g.GenreId = bg.GenreId
WHERE b.IsArchived = FALSE
GROUP BY b.BookId, b.Title, c.Name, p.Name
ORDER BY b.Title;
```

**Explicar:** `JOIN` reúne os dados relacionados; `LEFT JOIN` mantém livros mesmo quando não houver relação opcional; `GROUP_CONCAT` reúne autores e gêneros; `GROUP BY` evita duplicidade no resultado.

### Consulta 2 - Leitores e empréstimos ativos

```sql
SELECT r.RegistrationNumber,
       r.FullName,
       COUNT(l.LoanId) AS ActiveLoans,
       CASE WHEN r.IsSuspended THEN 'SUSPENDED' ELSE 'ACTIVE' END AS ReaderStatus
FROM Readers r
LEFT JOIN Loans l
       ON l.ReaderId = r.ReaderId
      AND l.ReturnedAt IS NULL
GROUP BY r.ReaderId, r.RegistrationNumber, r.FullName, r.IsSuspended
ORDER BY ActiveLoans DESC, r.FullName;
```

**Explicar:** `LEFT JOIN` inclui leitores sem empréstimo; o filtro `ReturnedAt IS NULL` identifica empréstimos ativos; `COUNT` totaliza os empréstimos por leitor; `CASE` traduz o status.

### Consulta 3 - Multas em aberto

```sql
SELECT r.FullName,
       b.Title,
       f.Amount,
       f.Reason,
       l.DueAt,
       CASE WHEN f.PaidAt IS NULL THEN 'OPEN' ELSE 'PAID' END AS FineStatus
FROM Fines f
JOIN Loans l ON l.LoanId = f.LoanId
JOIN Readers r ON r.ReaderId = l.ReaderId
JOIN Copies cp ON cp.CopyId = l.CopyId
JOIN Books b ON b.BookId = cp.BookId
WHERE f.PaidAt IS NULL
ORDER BY f.Amount DESC, l.DueAt;
```

**Explicar:** a consulta percorre multa → empréstimo → leitor e exemplar → livro; o filtro retorna somente multas não pagas; a ordenação destaca os maiores valores.

### Se o professor pedir uma consulta diferente

Seguir esta sequência mental:

1. Identificar qual tabela contém o fato principal.
2. Escolher as colunas do resultado.
3. Relacionar as tabelas pelas chaves estrangeiras.
4. Aplicar `WHERE` para filtrar.
5. Usar `GROUP BY` e funções de agregação quando houver contagem ou totalização.
6. Usar `HAVING` para filtrar resultados agrupados.
7. Ordenar com `ORDER BY`.

---

## Encerramento - Integrante 1

### Fala sugerida

> Com isso, demonstramos o fluxo completo exigido: partimos de um problema real, identificamos as entidades e regras, implementamos o banco, conectamos a aplicação e recuperamos informações por consultas SQL. O Biblioteca Hub centraliza os dados da biblioteca, mantém a integridade dos relacionamentos e oferece operações de cadastro, consulta, atualização e exclusão.
>
> Obrigado. Estamos à disposição para explicar qualquer decisão do cenário, do modelo, da aplicação ou das consultas.

## Checklist final

- [ ] O DER foi atualizado para refletir as dez entidades do banco.
- [ ] O PPTX contém nome do projeto, integrantes, cenário, problema, regras, entidades, relacionamentos, DER e tecnologias.
- [ ] O MySQL inicia e o banco `biblioteca` está acessível.
- [ ] A aplicação demonstra CREATE, READ, UPDATE e DELETE.
- [ ] As alterações da aplicação são confirmadas no banco.
- [ ] Os dados de demonstração estão relacionados e variados.
- [ ] Cada integrante consegue explicar as entidades, chaves e cardinalidades.
- [ ] O grupo treinou três consultas digitadas ao vivo.
- [ ] Os scripts SQL, código, PPTX e recursos estão organizados em uma pasta única.
