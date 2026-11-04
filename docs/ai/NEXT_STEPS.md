# Próximos passos

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

## Estado da tarefa atual

Concluída: React Testing Library foi configurado, os fluxos principais das páginas foram testados e Jest, cobertura, TypeScript e build foram executados com sucesso. A cobertura não é 100% e os ramos não exercitados permanecem explícitos no relatório do Jest.

## Próxima ação recomendada

Confirmar o escopo de cadastro/edição/exclusão visual de livros e, depois, evoluir o frontend para consumir a futura API sem remover a cobertura das regras de domínio.

## Critério de conclusão

Uma pendência só deve ser marcada como concluída depois de implementação e execução verificável dos testes correspondentes.
