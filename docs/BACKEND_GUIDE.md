# Guia do backend

## Testes HTTP

`backend/tests/Biblioteca.IntegrationTests` usa xUnit, `WebApplicationFactory` e SQLite em memória isolado por teste. A composição real da API, Application e Infrastructure é exercitada sem mocks do serviço de livros.

O backend usa .NET 8 LTS em camadas: Domain (entidades e invariantes), Application (DTOs e serviço), Infrastructure (EF Core/Npgsql/SQLite) e Api (Minimal API/Swagger). A Fase 1 cobre livros e exemplares; empréstimos, devoluções, leitores e autenticação permanecem planejados.

O código segue uma classe principal por arquivo, namespaces file-scoped, nullable habilitado, métodos assíncronos com `Async`/`CancellationToken`, DTOs separados, mapeamentos EF em `IEntityTypeConfiguration<T>` e endpoints agrupados em extensões da API.

Sem Docker, a configuração padrão usa SQLite em `backend/biblioteca.dev.db`: execute `dotnet restore`, `dotnet run --project src/Biblioteca.Api` e a API cria as tabelas, índices e restrições automaticamente. Para PostgreSQL, defina `Database__Provider=Postgres` e `ConnectionStrings__Biblioteca`, depois execute `dotnet ef database update --project src/Biblioteca.Infrastructure --startup-project src/Biblioteca.Api`.

Endpoints: `GET /api/books?search=`, `GET /api/books/{id}`, `POST /api/books`, `PUT /api/books/{id}` e `POST /api/books/{id}/archive`. ISBN-10/ISBN-13 é validado, normalizado e único; cadastro cria exemplares disponíveis e atualização respeita exemplares emprestados. A migration `InitialCreate` existente é PostgreSQL; SQLite usa `EnsureCreated` para não aplicar SQL de migration de outro provider. Testes xUnit ficam em `tests/Biblioteca.UnitTests`.
