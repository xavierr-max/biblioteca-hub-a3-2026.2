# Instruções permanentes para o Codex

Este arquivo é o ponto de entrada de contexto do projeto Biblioteca.

## Antes de iniciar qualquer tarefa

1. Ler este arquivo e os documentos relevantes de `docs/ai/`.
2. Inspecionar o código relacionado à tarefa.
3. Identificar o estado atual e as pendências.
4. Considerar as decisões arquiteturais registradas.
5. Planejar a alteração preservando o funcionamento existente.

## Durante a execução

1. Seguir a arquitetura e as convenções existentes.
2. Registrar decisões importantes em `docs/ai/DECISIONS.md`.
3. Atualizar os testes ao modificar comportamentos.
4. Não alterar regras de negócio sem justificativa.
5. Evitar mudanças fora do escopo.

## Ao concluir qualquer tarefa, inclusive parcialmente concluída

1. Executar as validações pertinentes.
2. Atualizar `docs/ai/CHANGELOG.md` com o trabalho efetivamente realizado.
3. Atualizar `docs/ai/NEXT_STEPS.md`.
4. Atualizar os demais documentos quando houver mudanças relevantes.
5. Registrar testes, resultados e limitações reais em `docs/ai/TESTING.md`.
6. Apresentar resumo objetivo da implementação.

Se a tarefa for interrompida ou ficar parcialmente concluída, registre igualmente o estado, os comandos executados, os resultados e o bloqueio em `CHANGELOG.md`, `TESTING.md` e `NEXT_STEPS.md`, conforme aplicável.

## Manutenção obrigatória da documentação de testes

Sempre que qualquer teste for criado, modificado ou removido:

1. Atualizar `docs/TESTING_GUIDE.md` e a lista/explicação dos testes afetados.
2. Atualizar `docs/TESTING_PRESENTATION.md` se exemplos ou roteiro forem impactados.
3. Atualizar `docs/ai/TESTING.md` com resultados reais.
4. Atualizar `docs/ai/CHANGELOG.md`.
5. Atualizar `docs/ai/NEXT_STEPS.md` quando necessário.

Sempre que uma regra de negócio for alterada, revisar os testes relacionados, atualizar a explicação do comportamento esperado e registrar o impacto na documentação correspondente.

Sempre que uma suíte for executada, registrar os resultados relevantes, a data da validação completa e distinguir métricas atuais de históricas. Nunca declarar validações não executadas.

Documentação antiga é apenas contexto: o código atual é a fonte de verdade. Não registrar credenciais, tokens ou dados sensíveis. Diferenciar claramente funcionalidades implementadas de planejadas.

## Plano de testes funcionais de caixa preta

1. Toda nova funcionalidade relevante deve gerar ou revisar casos em `docs/BLACK_BOX_TEST_PLAN.md`.
2. Alterações em regras de negócio devem atualizar os resultados esperados.
3. Casos removidos devem ser identificados e revisados.
4. Resultados obtidos somente podem ser registrados após execução real, com evidência.
5. A matriz de rastreabilidade deve permanecer sincronizada com requisitos e testes automatizados.
6. O plano deve ser atualizado em futuras tarefas que afetem funcionalidades ou testes.

## Contexto persistente

- [Contexto do projeto](docs/ai/PROJECT_CONTEXT.md)
- [Arquitetura](docs/ai/ARCHITECTURE.md)
- [Regras de negócio](docs/ai/BUSINESS_RULES.md)
- [Testes](docs/ai/TESTING.md)
- [Próximos passos](docs/ai/NEXT_STEPS.md)
- [Decisões](docs/ai/DECISIONS.md)
