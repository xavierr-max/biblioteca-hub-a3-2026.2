# Sistema de Gestão de Biblioteca

Projeto acadêmico de Banco de Dados e Testes de Software. Primeira etapa: modelagem MySQL, documentação e preparação para ASP.NET Core 10 e React/TypeScript.

## Subir

Copie `.env.example` para `.env`, execute `docker compose up -d` e aguarde `docker compose ps` mostrar `healthy`. No DBeaver use `localhost:3306`, banco `biblioteca`, e as credenciais do `.env`.

O volume `biblioteca_mysql_data` é persistente. Não removemos containers ou volumes existentes.

## Próximos passos

Criar a solution .NET 10 e migrations, implementar serviços e testes, depois criar o frontend e cenários Playwright.
