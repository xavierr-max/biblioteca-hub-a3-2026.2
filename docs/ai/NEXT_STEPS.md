# Próximos passos

Após a gestão de leitores, a próxima etapa é implementar empréstimos, mantendo as restrições de leitor regular, livro ativo, exemplar disponível e datas válidas já documentadas. A API de leitores não inclui exclusão nesta fase porque o frontend condiciona essa operação ao histórico de empréstimos, ainda não persistido no backend.

Revisar e então versionar o projeto `Biblioteca.IntegrationTests` e a correção de rastreamento de exemplares; não foi criado um segundo commit nesta tarefa.

## Após Fase 2

Revisar os testes HTTP e decidir se a expansão da quantidade de exemplares deve receber um caso dedicado; os testes atuais cobrem atualização, restrições negativas e a regra de exemplares emprestados permanece no domínio.

## Backend

Disponibilizar PostgreSQL/Docker e aplicar a migration; adicionar leitores, empréstimos, devoluções e histórico; depois planejar cliente HTTP sem remover inicialmente o localStorage.

SQLite já está disponível sem Docker para desenvolvimento e testes. PostgreSQL continua pendente de ambiente/credenciais para validação real.

A organização estrutural foi concluída; futuras mudanças devem seguir o `.editorconfig` e a regra de uma classe principal por arquivo.

## Plano de caixa preta

- Executar os 17 casos ainda não executados de `docs/BLACK_BOX_TEST_PLAN.md`, priorizando cadastro/edição de livros, validações negativas, bloqueios de empréstimo, devoluções inválidas e relatórios.
- Manter `docs/BLACK_BOX_TEST_EXECUTION.md` sincronizado com cada nova execução.
- Revisar a matriz sempre que nomes/arquivos de testes Jest ou requisitos mudarem.

## Backend ASP.NET Core — proposta inicial (não implementada)

- Criar uma solução ASP.NET Core Web API separada, com camadas `Api`, `Application`, `Domain` e `Infrastructure`.
- Manter `Book`, `BookCopy`, `Reader`, `Loan` e `User` no domínio; casos de uso na Application; DTOs/controllers na API; EF Core e migrations na Infrastructure.
- Persistir catálogo e circulação em banco relacional, com índices para ISBN/identificador e transações para empréstimo/devolução.
- Expor endpoints versionados e substituir gradualmente as operações locais do `LibraryContext` por cliente HTTP.
- Cobrir domínio e casos de uso com xUnit, incluindo disponibilidade, bloqueios, datas e concorrência.
- Migrar o `localStorage` por exportador JSON versionado e endpoint/importador administrativo com validação e reconciliação.

Esta proposta é planejamento; o backend não foi implementado nesta tarefa.

## Pendências

- Completar testes visuais de edição/exclusão quando esses fluxos forem expostos pela `BooksPage`.
- Aumentar cobertura de ramos raros do `LibraryContext` conforme novos fluxos forem alterados.
- Manter `docs/TESTING_GUIDE.md` e `docs/TESTING_PRESENTATION.md` sincronizados quando a suíte evoluir.

## Estado da tarefa atual

Concluída: React Testing Library foi configurado, os fluxos principais das páginas foram testados e Jest, cobertura, TypeScript e build foram executados com sucesso. A cobertura não é 100% e os ramos não exercitados permanecem explícitos no relatório do Jest.

## Próxima ação recomendada

Confirmar o escopo de cadastro/edição/exclusão visual de livros e, depois, evoluir o frontend para consumir a futura API sem remover a cobertura das regras de domínio.

## Critério de conclusão

Uma pendência só deve ser marcada como concluída depois de implementação e execução verificável dos testes correspondentes.
## Apos Fase 4

Emprestimos e devolucoes basicos estao implementados e validados em SQLite. Proximos passos: executar a migration em PostgreSQL autorizado, adicionar teste de concorrencia multi-processo no PostgreSQL e planejar integracao gradual do frontend sem remover `localStorage`.
