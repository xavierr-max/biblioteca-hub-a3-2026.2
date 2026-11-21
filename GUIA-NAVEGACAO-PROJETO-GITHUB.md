# Guia simples para navegar pelo projeto Biblioteca Hub

Este guia foi feito para quem vai apresentar o projeto, mas não trabalha diariamente com programação. A ideia é mostrar onde cada coisa está e qual ordem seguir para estudar.

## 1. Comece por estes arquivos

Na página principal do GitHub, abra:

1. `README.md` — explica o projeto e como iniciar.
2. `docs/OBJETIVOS-DO-PROJETO.md` — explica o objetivo e o escopo.
3. `docs/RELATORIO-FINAL-A3.md` — é o resumo formal do trabalho.
4. `docs/ROTEIRO-A3-BANCO-DE-DADOS.md` — é o roteiro principal da apresentação.
5. `Biblioteca-Hub-A3-editavel.pptx` — são os slides.

Se você tiver pouco tempo, leia primeiro o roteiro e o relatório.

## 2. O que existe em cada pasta

### `docs/`

É a pasta de explicações do projeto.

- `OBJETIVOS-DO-PROJETO.md`: o que o sistema pretende resolver.
- `MEMORIA-DA-APLICACAO.md`: estado atual, decisões e limitações.
- `RELATORIO-FINAL-A3.md`: relatório completo.
- `PITCH-ROTEIRO-A3.md`: sequência resumida dos slides.
- `ROTEIRO-APRESENTACAO-A3-4-INTEGRANTES.md`: divisão das falas do grupo.
- `ROTEIRO-A3-BANCO-DE-DADOS.md`: versão mais completa, alinhada às exigências da avaliação.

Dentro de `docs/banco-de-dados/`:

- `modelo-logico.md`: entidades, campos, chaves e relacionamentos.
- `regras-de-negocio.md`: regras que impedem dados incorretos.

### `database/`

É a parte mais importante para a disciplina de Banco de Dados.

- `scripts/01-schema.sql`: cria as tabelas do banco.
- `scripts/02-demo-queries.sql`: consultas SQL para estudar e treinar.
- `scripts/03-a3-expansion.sql`: amplia o banco com novas tabelas.
- `seeds/01-demo-data.sql`: insere dados fictícios para a demonstração.
- `diagrams/`: arquivos do diagrama do banco.

### `DER.pdf`, `DER.svg` e `DER.mmd`

São versões do diagrama entidade-relacionamento. O DER mostra as tabelas e como elas se ligam. Use o PDF durante a apresentação.

### `backend/`

É a parte que recebe os pedidos da aplicação e conversa com o banco.

- `Biblioteca.Api/Program.cs`: endpoints de cadastro, consulta, alteração, exclusão, empréstimo e devolução.
- `Biblioteca.Domain/Entities.cs`: entidades do sistema.
- `Biblioteca.Domain/LoanRules.cs`: regras dos empréstimos.
- `Biblioteca.Infrastructure/LibraryDbContext.cs`: ligação entre o código e as tabelas do banco.
- `Biblioteca.Tests/`: testes automáticos.

Você não precisa decorar o código. Saiba explicar qual responsabilidade cada arquivo tem.

### `frontend/`

É a parte visual que aparece no navegador.

- `src/App.tsx`: telas e funcionamento principal.
- `src/services/api.ts`: comunicação com a API.
- `src/App.css` e `src/index.css`: aparência visual.

### `tests/`

Guarda evidências dos testes realizados.

- `tests/evidencias/api-black-box-2026-11-18.md`: cenários de API que foram testados.
- `tests/e2e/README.md`: informações sobre testes de ponta a ponta.

### Arquivos de inicialização

- `iniciar-biblioteca.cmd`: inicia o sistema no Windows.
- `parar-biblioteca.cmd`: encerra o sistema sem apagar o banco.
- `compose.yaml`: configura o MySQL em Docker.
- `.env.example`: exemplo das configurações necessárias.

## 3. Ordem para estudar antes da apresentação

1. Leia o resumo do relatório.
2. Leia o roteiro da apresentação.
3. Abra o DER e aprenda a explicar as dez entidades.
4. Leia as regras de negócio.
5. Abra `database/scripts/01-schema.sql` para reconhecer tabelas, chaves e restrições.
6. Abra `database/seeds/01-demo-data.sql` para entender os dados de exemplo.
7. Treine as consultas de `database/scripts/02-demo-queries.sql`.
8. Treine a demonstração do sistema.

## 4. Como a apresentação deve navegar pela pasta

Siga esta sequência:

1. **Cenário:** use o relatório e os objetivos.
2. **Entidades e relações:** use `docs/banco-de-dados/` e o DER.
3. **Aplicação:** inicie pelo `iniciar-biblioteca.cmd` e demonstre cadastro, consulta, alteração e exclusão.
4. **DER:** abra `DER.pdf` e mostre as ligações.
5. **Banco:** abra o MySQL Workbench ou DBeaver e mostre tabelas e dados.
6. **SQL:** abra o arquivo de consultas apenas como apoio; treine escrever as consultas durante a avaliação.

## 5. Dicionário rápido

- **Entidade:** algo importante do cenário, como Livro ou Leitor.
- **Tabela:** a forma como uma entidade é guardada no banco.
- **Registro:** uma linha da tabela, como um livro específico.
- **Chave primária (PK):** identifica um registro sem repetição.
- **Chave estrangeira (FK):** liga um registro a outro.
- **CRUD:** criar, consultar, atualizar e excluir.
- **JOIN:** junta informações de duas ou mais tabelas.
- **Seed:** dados fictícios usados para demonstrar o sistema.
- **DER:** desenho das tabelas e dos relacionamentos.

## 6. O que cada integrante deve saber

Mesmo com divisão de falas, qualquer integrante pode ser questionado.

- Cenário, problema e regras de negócio.
- Dez entidades e motivo de cada uma existir.
- Diferença entre livro e exemplar.
- Como um livro se relaciona com autor e gênero.
- Onde ficam as chaves primárias e estrangeiras.
- Como a aplicação grava no MySQL.
- Como funciona CREATE, READ, UPDATE e DELETE.
- Como montar uma consulta com `JOIN`, `WHERE`, `GROUP BY` e `ORDER BY`.

## 7. Checklist do dia

- [ ] O repositório abre normalmente no GitHub.
- [ ] O PPTX está acessível.
- [ ] O DER abre.
- [ ] O MySQL inicia.
- [ ] A aplicação inicia pelo arquivo correto.
- [ ] Existem dados de demonstração.
- [ ] O grupo ensaiou CRUD com confirmação no banco.
- [ ] O grupo treinou três consultas SQL escritas do zero.
- [ ] Todos sabem explicar o projeto inteiro, não apenas a própria parte.

## 8. Se algo der errado

Não apague arquivos nem recrie o banco sem orientação. Consulte primeiro `README.md`, `docs/MEMORIA-DA-APLICACAO.md` e `docs/RELATORIO-FINAL-A3.md`. Para a apresentação, mantenha o DER, os slides, o relatório e as consultas SQL disponíveis como plano B.
