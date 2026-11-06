# Guia do backend

## Gestão de leitores — Fase 3

Endpoints disponíveis: `GET /api/readers?search=`, `GET /api/readers/{id}`, `POST /api/readers`, `PUT /api/readers/{id}` e `PATCH /api/readers/{id}/status`. O cadastro exige nome e identificador, valida e-mail/telefone opcionais, inicia em `REGULAR` e impede identificadores duplicados sem diferenciar maiúsculas/minúsculas. O status aceita `REGULAR`, `SUSPENDED` e `BLOCKED`.

## Testes HTTP

`backend/tests/Biblioteca.IntegrationTests` usa xUnit, `WebApplicationFactory` e SQLite em memória isolado por teste. A composição real da API, Application e Infrastructure é exercitada sem mocks do serviço de livros.

O backend usa .NET 8 LTS em camadas: Domain (entidades e invariantes), Application (DTOs e serviço), Infrastructure (EF Core/Npgsql/SQLite) e Api (Minimal API/Swagger). A Fase 1 cobre livros e exemplares; empréstimos, devoluções, leitores e autenticação permanecem planejados.

O código segue uma classe principal por arquivo, namespaces file-scoped, nullable habilitado, métodos assíncronos com `Async`/`CancellationToken`, DTOs separados, mapeamentos EF em `IEntityTypeConfiguration<T>` e endpoints agrupados em extensões da API.

Sem Docker, a configuração padrão usa SQLite em `backend/biblioteca.dev.db`: execute `dotnet restore`, `dotnet run --project src/Biblioteca.Api` e a API cria as tabelas, índices e restrições automaticamente. Para PostgreSQL, defina `Database__Provider=Postgres` e `ConnectionStrings__Biblioteca`, depois execute `dotnet ef database update --project src/Biblioteca.Infrastructure --startup-project src/Biblioteca.Api`.

Endpoints: `GET /api/books?search=`, `GET /api/books/{id}`, `POST /api/books`, `PUT /api/books/{id}` e `POST /api/books/{id}/archive`. ISBN-10/ISBN-13 é validado, normalizado e único; cadastro cria exemplares disponíveis e atualização respeita exemplares emprestados. A migration `InitialCreate` existente é PostgreSQL; SQLite usa `EnsureCreated` para não aplicar SQL de migration de outro provider. Testes xUnit ficam em `tests/Biblioteca.UnitTests`.
## Fase 4 - emprestimos e devolucoes

O ciclo de circulacao e persistido em `Loan`, que preserva livro, exemplar, leitor, datas, status e devolucao. A API deriva `OVERDUE` para emprestimos ativos vencidos, sem tabela de movimentos redundante.

Endpoints: `GET /api/loans`, `GET /api/loans/{id}`, `POST /api/loans` e `POST /api/loans/{id}/return`. A listagem aceita `?status=ACTIVE|OVERDUE|RETURNED`. O emprestimo exige leitor `REGULAR`, livro nao arquivado, exemplar disponivel, data nao futura e prazo posterior. A devolucao exige registro aberto, exemplar emprestado e data entre o emprestimo e hoje.

`AddLoans` foi gerada com `dotnet-ef` 8.0.10 usando `Database__Provider=Postgres`, sem modificar migrations anteriores. SQLite usa `EnsureCreated` e memoria nos testes; PostgreSQL aplica migrations com `dotnet ef database update`.

O indice unico filtrado por exemplar e a transacao EF Core impedem dois emprestimos abertos do mesmo exemplar. Concorrencia multi-processo com PostgreSQL ainda precisa ser validada em ambiente autorizado.

## Integracao com o frontend - Fase 5.1

O frontend inicia em modo `local` por padrao e continua usando `localStorage`. Para o modo API, copie `frontend/.env.example` para `frontend/.env.local` e defina `VITE_DATA_MODE=api` e `VITE_API_BASE_URL=http://localhost:5219`. Execute a API em `http://localhost:5219` e o Vite na porta configurada pelo projeto.

No modo API, livros sao carregados por `GET /api/books` e cadastrados por `POST /api/books`; os exemplares retornados sao mapeados para o modelo TypeScript. A API e a fonte de verdade dos livros e nao ha fallback silencioso para `localStorage`. Leitores, emprestimos, devolucoes, edicao e arquivamento ainda permanecem locais nesta etapa; o modo API e experimental e nao migra dados automaticamente.
