# Biblioteca — Resumo para apresentação de testes

## Relação com o plano de caixa preta

Para a apresentação funcional, consulte [`BLACK_BOX_TEST_PLAN.md`](BLACK_BOX_TEST_PLAN.md), que contém 23 casos planejados, técnicas de caixa preta e roteiro de aproximadamente cinco minutos. Os casos ainda não executados permanecem separados dos 21 testes Jest automatizados.

## Ideia central

Os testes automatizados verificam se a Biblioteca continua respeitando suas regras: dados válidos entram, operações inválidas são bloqueadas e empréstimos/devoluções atualizam o acervo corretamente. A aplicação é React; as regras vivem no `LibraryContext` e em funções de domínio.

## Tecnologias

- **Jest:** executa e organiza os testes.
- **ts-jest:** permite testar TypeScript/TSX.
- **React Testing Library:** renderiza páginas reais em jsdom.
- **jest-dom:** matchers para DOM, como `toBeInTheDocument`.
- **user-event:** simula clique, digitação e seleção.
- **pnpm:** instala dependências e executa scripts.

## Três exemplos comentados

### 1. Unidade: devolução

Arquivo: `frontend/src/domain/__tests__/returnRules.test.ts`.

```ts
const result = applyReturnOperation(
  'loan-1', '2026-11-05', [loan], [copy], '2026-11-10'
);
expect(result.success).toBe(true);
expect(result.nextCopies).toEqual([{ ...copy, status: 'AVAILABLE' }]);
```

O teste entrega empréstimo e exemplar válidos à função pura. Depois verifica que o empréstimo foi aceito e que a cópia ficou disponível. Não precisa de React nem de DOM.

### 2. Integração: empréstimo e devolução

Arquivo: `frontend/src/context/__tests__/LibraryContext.integration.test.tsx`.

```ts
await act(async () => {
  result = api.addLoan({
    readerId: 'r-4', copyId: 'c-1',
    loanDate: '2026-11-01', dueDate: '2026-11-10'
  });
});
expect(api.copies.find((copy) => copy.id === 'c-1').status)
  .toBe('LOANED');
```

Aqui o `LibraryProvider` real está montado. O teste verifica o efeito integrado em exemplar, livro, leitor e persistência, e depois registra a devolução.

### 3. Interface: wizard de empréstimo

Arquivo: `frontend/src/pages/__tests__/pages.integration.test.tsx`.

```ts
await user.click(screen.getByRole('button', { name: /Novo empr/ }));
await user.click(screen.getByRole('button', { name: /Gabriel Alves Ribeiro/ }));
await user.click(screen.getByRole('button', { name: /C.digo Limpo/ }));
await user.click(screen.getByRole('button', { name: /EX-001/ }));
await user.click(screen.getByRole('button', { name: /Confirmar empr/ }));
```

Esse cenário representa ações de uma pessoa: abre o fluxo, escolhe leitor/livro/exemplar e confirma. A verificação encontra `EX-001` na listagem final.

## Roteiro de 5 a 8 minutos

1. **0:00–1:00 — Introdução:** explique que testes verificam comportamentos repetíveis e previnem regressões.
2. **1:00–2:00 — Estrutura:** mostre `context/__tests__`, `domain/__tests__` e `pages/__tests__`.
3. **2:00–3:10 — Unidade:** explique `applyReturnOperation`, entradas controladas e `expect`.
4. **3:10–4:30 — Integração:** explique `LibraryProvider`, `act`, atualização de cópia/disponibilidade/leitor e `localStorage`.
5. **4:30–5:50 — Interface:** mostre `render`, `screen` e `userEvent` no wizard de empréstimo.
6. **5:50–6:40 — Execução:** rode os testes e mostre 5 suítes/21 testes aprovados.
7. **6:40–7:30 — Cobertura:** rode a cobertura e explique statements, branches e o escopo configurado.
8. **7:30–8:00 — Conclusão:** destaque que cobertura é evidência, não garantia absoluta; cenários relevantes importam mais que 100% artificial.

### Fala sugerida

“Nesta Biblioteca, eu separei os testes em três níveis. No nível unitário, verifico funções puras, como a regra que valida uma devolução. No nível de integração, monto o `LibraryProvider` real para verificar se um empréstimo altera o exemplar, a disponibilidade do livro e o contador do leitor. No nível de interface, uso React Testing Library para realizar as ações que o usuário faria no wizard: selecionar leitor, livro, exemplar e confirmar. Assim, não estou testando apenas detalhes internos: estou verificando o comportamento observável. A última execução passou com 5 suítes e 21 testes. A cobertura de statements foi 72,54% no escopo configurado, que inclui o contexto e o domínio, mas não todas as páginas.”

## Comandos para demonstração

Execute a partir de `frontend/`:

```bash
corepack pnpm@10 test
corepack pnpm@10 test:watch
corepack pnpm@10 test:coverage
corepack pnpm@10 exec tsc --noEmit
corepack pnpm@10 build
```

Resultado atual de `test`: 5 suítes aprovadas, 21 testes aprovados e 0 falhas. A cobertura é gerada em `frontend/coverage/`, que é um artefato ignorado pelo Git.

## Perguntas possíveis do professor

**Por que usar testes unitários e de integração?**

Testes unitários localizam rapidamente erros em regras isoladas. Integração verifica se essas regras funcionam corretamente junto do estado e da persistência.

**Por que não testar apenas clicando manualmente na aplicação?**

O teste manual é útil, mas é mais lento, menos repetível e fácil de esquecer. O teste automatizado registra o cenário e pode ser executado após cada alteração.

**O que `act` resolve?**

Agrupa atualizações de estado React para que as verificações ocorram depois que o estado foi processado.

**Por que não há mocks do contexto?**

Nos fluxos críticos, o objetivo é testar as regras reais. Mockar o contexto poderia esconder uma regressão em `addLoan` ou `registerReturn`.

**Cobertura de 72,54% significa que 72,54% do sistema está correto?**

Não. Significa que 72,54% das instruções do escopo instrumentado foram executadas. A qualidade depende também das afirmações e dos cenários escolhidos.

**Por que a cobertura não inclui todas as páginas?**

O `collectCoverageFrom` atual coleta `LibraryContext.tsx` e `domain/**/*.ts`. As páginas possuem testes de interface, mas não entram na métrica atual de cobertura.

**O que seria testado no futuro backend .NET?**

Entidades e casos de uso poderiam ter testes xUnit; persistência e endpoints teriam testes de integração, incluindo disponibilidade, datas, bloqueios e concorrência.

## Referência completa

Consulte [`TESTING_GUIDE.md`](TESTING_GUIDE.md) para a explicação individual dos 21 testes, arquitetura, cobertura, limitações e detalhes de execução.
