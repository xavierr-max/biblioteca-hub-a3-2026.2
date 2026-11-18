# Memória da aplicação

## Estado atual

- Projeto: sistema de gestão de biblioteca.
- Backend: ASP.NET Core 10, API REST, MySQL 8.4 em Docker.
- Frontend: React + TypeScript + Vite, tema escuro com acentos laranja.
- Entidades principais: livros, leitores, exemplares e empréstimos.
- CRUD REST disponível para as quatro entidades.
- Dashboard e telas de gestão consomem dados exclusivamente da API.
- A aba ativa é preservada após F5.
- Cards são a visualização padrão das telas de gestão; lista é opcional.
- Relatórios foi removido da sidebar.
- Edição e confirmação de exclusão devem usar modais da aplicação; nunca usar `alert`, `confirm` ou `prompt` nativos.
- Banco MySQL 8.4 está sendo executado pelo Docker Compose no container `biblioteca-gestao-mysql`.
- O banco `biblioteca` foi conectado com sucesso pelo DBeaver 26.2.1 em `localhost:3306` usando o usuário `biblioteca_app`.
- O DBeaver precisou das propriedades JDBC `allowPublicKeyRetrieval=true` e `useSSL=false`, devido ao plugin de autenticação `caching_sha2_password` do MySQL 8.
- O schema está acessível e contém as tabelas `Authors`, `BookAuthors`, `Books`, `Categories`, `Copies`, `Loans` e `Readers`.
- O schema foi ampliado com `Publishers`, `Genres`, `BookGenres`, `Reservations` e `Fines`.
- A migration EF Core `A3Expansion` foi gerada em `backend/Biblioteca.Infrastructure/Migrations`.

## Decisões e convenções

- Não inserir mocks ou dados fictícios no frontend.
- Após qualquer mutação, recarregar os dados relacionados da API.
- Respeitar as regras de integridade do domínio para exclusões.
- Manter o design visual consistente com o dashboard existente.
- Validar backend, frontend e testes antes de publicar.

## Histórico recente

- Implementado CRUD REST completo.
- Removida a aba de Relatórios.
- Adicionada alternância Cards/Lista.
- Substituídos diálogos nativos por modais próprios.
- Modo Lista padronizado com colunas alinhadas para identificação, detalhe, status e ações.
- API de categorias e autores criada; `GET /api/books` retorna categoria e autores relacionados.
- Frontend possui telas de Categorias e Autores com cards e modais de criação/edição, além de exclusão integrada à API.
- Sidebar usa Google Fonts Material Symbols Rounded; ícone distinto por seção, incluindo Configurações.
- Barra superior sem campo de pesquisa, mantendo ações e perfil alinhados à direita.
- Perfil local editável da bibliotecária (nome, sobrenome, e-mail e telefone), armazenado no navegador; o sistema não exige autenticação nem criação de conta.
- Card promocional “Biblioteca em movimento” removido da sidebar.
- Link “Configurações” removido; sidebar fixa na viewport e apenas o conteúdo principal rola. Perfil fica ancorado no rodapé da sidebar.
- Container MySQL anterior relacionado à biblioteca foi removido e recriado sem apagar o volume persistente.
- Conexão externa pelo DBeaver foi validada com sucesso.
- Backend validado após a expansão: build sem warnings e 10 testes automatizados aprovados.
- Frontend atualizado para carregar e exibir editoras, gêneros, reservas e multas via API.
- Build de produção do frontend aprovado após `npm install` e `npm run build`.
- Frontend agora possui formulários conectados à API para cadastrar editoras, gêneros, reservas e multas.
- Formulário de livros passou a carregar categorias, editoras e gêneros diretamente da API; gênero e editora são enviados no cadastro.
- Após a correção de processo bloqueando o executável, backend e frontend foram validados novamente: build aprovado e 10 testes backend aprovados.
- Seed ampliado e aplicado no banco atual: 5 livros, 5 exemplares, 4 leitores, 1 empréstimo atrasado, 1 reserva ativa e 1 multa em aberto.
- `02-demo-queries.sql` agora contém três consultas de apresentação envolvendo acervo, empréstimos e multas, e foi executado com sucesso no MySQL.
- Suíte backend ampliada para 14 testes aprovados, incluindo razões de rejeição e valores-limite das regras de empréstimo.
- Evidência de cobertura gerada em `tests/evidencias/backend-coverage`; cobertura global atual: 5,04% de linhas e 3,14% de branches, indicando a necessidade de testes adicionais de API e frontend.
- Criados os lançadores clicáveis `iniciar-biblioteca.cmd` e `parar-biblioteca.cmd` para iniciar/parar a aplicação localmente; o lançador inicia o MySQL, API, frontend e abre o navegador.
- `npm run lint` permanece pendente por bloqueio da política de execução do Windows sobre o binário nativo do `oxlint`.

## Próximas etapas para conclusão da A3

1. Conferir a aderência do modelo ao requisito mínimo de 10 entidades significativas.
2. Revisar e completar as regras de negócio e validações da API.
3. Ampliar o povoamento do banco para suportar demonstrações e consultas SQL variadas.
4. Finalizar testes de caixa preta, caixa branca e interface, guardando evidências.
5. Produzir o relatório final da disciplina.
6. Montar o pitch/PPTX com cenário, problema, regras, entidades, DER, tecnologias e demonstração CRUD.
7. Preparar três consultas SQL para execução ao vivo no MySQL Workbench/DBeaver.
8. Validar o projeto em ambiente limpo: Docker, backend, frontend, build, lint e testes.
