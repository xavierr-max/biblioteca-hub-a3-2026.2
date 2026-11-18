# Sistema de Gestão de Biblioteca

Projeto acadêmico de Banco de Dados e Testes de Software. Primeira etapa: modelagem MySQL, documentação e preparação para ASP.NET Core 10 e React/TypeScript.

## Subir

Copie `.env.example` para `.env`, execute `docker compose up -d` e aguarde `docker compose ps` mostrar `healthy`. O primeiro start cria automaticamente o schema e carrega os dados de demonstração em `database/scripts/01-schema.sql` e `database/seeds/01-demo-data.sql`.

No MySQL Workbench ou DBeaver use `localhost:3306`, banco `biblioteca`, e as credenciais do `.env`. A senha deve permanecer somente no `.env` local, que está ignorado pelo Git.

Comandos úteis:

```powershell
docker compose up -d
docker compose ps
docker compose logs mysql
docker compose exec mysql mysql -u biblioteca_app -p biblioteca -e "SHOW TABLES;"
```

Para recriar o banco do zero, removendo os dados locais do projeto:

```powershell
docker compose down -v
docker compose up -d
```

O carregamento automático ocorre somente quando o volume é novo. As tabelas atendem ao modelo lógico da A3, com chaves primárias, estrangeiras, unicidade, checks e índices documentados em `docs/banco-de-dados/`.

O volume `biblioteca_mysql_data` é persistente. Não removemos containers ou volumes existentes.

## Próximos passos

Criar a solution .NET 10 e migrations, implementar serviços e testes, depois criar o frontend e cenários Playwright.
