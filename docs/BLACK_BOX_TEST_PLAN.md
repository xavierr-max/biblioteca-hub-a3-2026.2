# Plano de Testes Funcionais de Caixa Preta — Sistema Biblioteca

## 1. Identificação

| Item | Informação |
|---|---|
| Sistema | BibliotecaHub — Sistema Biblioteca |
| Objetivo | Planejar a verificação funcional de comportamentos observáveis, sem depender da implementação interna. |
| Versão | 1.0 |
| Última atualização | 06/11/2026 |
| Escopo | Livros/acervo, exemplares, leitores, empréstimos, devoluções, histórico e relatórios do frontend. |
| Ambiente | Aplicação web React/Vite; dados prototipais persistidos em `localStorage`. |
| Tecnologias | React 19, TypeScript 5.7, Vite 8, Jest 30, React Testing Library 16 e pnpm 10. |

## 2. Introdução

Teste de caixa preta verifica entradas, ações e saídas observáveis sem exigir conhecimento da implementação interna. O objetivo é confirmar requisitos funcionais para entradas válidas, inválidas e combinações relevantes. Na Biblioteca, isso inclui mensagens de validação, registros exibidos, disponibilidade, status de empréstimos, histórico e relatórios.

Caixa branca verifica estruturas internas, funções, caminhos de código e cobertura de decisões. Caixa preta verifica o sistema pela perspectiva do usuário. As duas abordagens são complementares; os testes funcionais são importantes para confirmar que a Biblioteca atende à operação real mesmo quando sua implementação muda.

## 3. Escopo funcional confirmado

| Funcionalidade | Situação observada |
|---|---|
| Cadastro, edição, exclusão/arquivamento de livros | Disponível em `BooksPage`, com formulário e ações. |
| Consulta e pesquisa de livros | Disponível, com busca, filtros de categoria/disponibilidade/arquivamento e ordenação. |
| Gestão de exemplares | Disponível na ficha do livro, com status e localização. |
| Cadastro, edição, desativação e exclusão de leitores | Disponível em `ReadersPage`, com validações. |
| Empréstimos | Fluxo visual de quatro etapas, condicionado a leitor, livro, exemplar e datas válidos. |
| Disponibilidade | Exibida e recalculada após empréstimo/devolução. |
| Devoluções | Disponíveis para empréstimos pendentes, com data efetiva. |
| Histórico | Disponível na tela de devoluções e nos relatórios. |
| Relatórios | Catálogo, empréstimos, devoluções e histórico, com filtros e CSV. |
| Dashboard | Tela existente, mas não é tratado como operação principal neste plano. |
| Usuários/autenticação | Rota/tela existe; fluxo funcional de autenticação não foi confirmado. |

## 4. Técnicas de caixa preta

| Técnica | Aplicação |
|---|---|
| Particionamento de equivalência | Entradas válidas/inválidas, obrigatoriedade, formatos de ISBN/e-mail/telefone e estados disponível/indisponível. |
| Análise de valor-limite | Quantidade não negativa, datas não futuras, devolução posterior ao empréstimo e períodos disponíveis. Não foram inventados limites sem regra no projeto. |
| Tabela de decisão | Combinação de leitor regular, livro ativo, exemplar disponível e datas válidas para permitir/bloquear empréstimos e devoluções. |
| Transição de estados | Disponível → emprestado → devolvido; empréstimo ativo/atrasado → finalizado. |

## 5. Casos de teste

### 5.1 Livros, acervo e exemplares

| ID | Funcionalidade | Cenário de teste | Pré-condições | Dados de entrada | Passos de execução | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|---|---|---|
| CT-LIV-001 | Cadastro de livros | Cadastrar livro com dados válidos | Tela aberta; ISBN não cadastrado | Título, autor, ISBN válido, categoria, editora, ano e 2 exemplares | Abrir Novo Livro; preencher; salvar | Livro aparece com quantidade e disponibilidade corretas | — | Não executado |
| CT-LIV-002 | Validação de livros | Cadastrar sem título, autor ou ISBN | Formulário aberto | Um ou mais obrigatórios vazios | Tentar salvar | Cadastro bloqueado e mensagens nos campos obrigatórios | — | Não executado |
| CT-LIV-003 | Validação de livros | Rejeitar ISBN inválido e duplicado | Formulário aberto; existir ISBN cadastrado | ISBN com dígito inválido; depois ISBN já usado | Informar e salvar | Cada tentativa é rejeitada sem criar registro | — | Não executado |
| CT-LIV-004 | Quantidade de exemplares | Informar quantidade negativa e reduzir exemplares emprestados | Livro com exemplar emprestado | Quantidade negativa; redução que atingiria exemplar emprestado | Editar e salvar | Negativo rejeitado; exemplar emprestado não é removido | — | Não executado |
| CT-LIV-005 | Consulta de livros | Pesquisar existente, inexistente e filtrar disponibilidade | Acervo inicial carregado | `Redes`, termo inexistente, filtro “Apenas disponíveis” | Digitar e selecionar filtro | Resultado correspondente permanece; busca vazia mostra estado vazio | Teste RTL pesquisou `Redes`: “Redes de Computadores” permaneceu visível e “Código Limpo” deixou de aparecer. A parte de termo inexistente/filtro não foi exercitada. | Aprovado |
| CT-LIV-006 | Gestão de exemplares | Tentar disponibilizar exemplar emprestado e editar exemplar permitido | Ficha com ambos os estados | `AVAILABLE` para emprestado; novo status/localização para outro | Abrir ficha; editar; salvar | Primeira operação bloqueada; segunda refletida | — | Não executado |
| CT-LIV-007 | Exclusão/arquivamento | Excluir livro sem histórico e tentar excluir livro com histórico | Existirem os dois cenários | Confirmação de exclusão | Usar Excluir e confirmar | Sem histórico pode excluir; com histórico não exclui definitivamente e pode arquivar | — | Não executado |

### 5.2 Leitores

| ID | Funcionalidade | Cenário de teste | Pré-condições | Dados de entrada | Passos de execução | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|---|---|---|
| CT-LEI-001 | Cadastro de leitores | Cadastrar leitor válido | Identificador não utilizado | Nome, matrícula, e-mail e telefone válidos | Abrir Novo Leitor; preencher; cadastrar | Leitor aparece como regular | Teste RTL abriu “Novo Leitor”, informou nome, identificador e e-mail válidos e encontrou “Leitor de Interface” na listagem. O telefone não foi preenchido nesse teste. | Aprovado |
| CT-LEI-002 | Validação de leitores | Cadastrar sem nome ou identificador | Formulário aberto | Nome vazio; identificador vazio | Tentar cadastrar | Operação bloqueada com mensagens de obrigatoriedade | Teste RTL tentou cadastrar o formulário vazio e encontrou a mensagem de nome obrigatório. A ausência de identificador não foi verificada isoladamente. | Aprovado |
| CT-LEI-003 | Validação de contato | Informar e-mail ou telefone inválido | Formulário aberto | `invalido`; telefone sem DDD/dígitos válidos | Preencher e salvar | Cadastro bloqueado com mensagem do campo | — | Não executado |
| CT-LEI-004 | Unicidade e situação | Repetir identificador e desativar/reativar leitor | Existir leitor cadastrado | Identificador duplicado; ações de situação | Tentar cadastrar; abrir ficha; alternar situação | Duplicidade rejeitada; leitor pode ser desativado e reativado | — | Não executado |

### 5.3 Empréstimos

| ID | Funcionalidade | Cenário de teste | Pré-condições | Dados de entrada | Passos de execução | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|---|---|---|
| CT-EMP-001 | Empréstimo | Emprestar exemplar disponível a leitor regular | Leitor regular; livro ativo; exemplar disponível | Gabriel Alves Ribeiro; Código Limpo; `EX-001`; datas válidas | Abrir fluxo; selecionar; informar datas; confirmar | Empréstimo aparece; exemplar fica emprestado; contadores atualizam | Teste RTL percorreu as quatro etapas, selecionou Gabriel Alves Ribeiro, Código Limpo e `EX-001`, confirmou e encontrou `EX-001` na listagem de empréstimos. | Aprovado |
| CT-EMP-002 | Regra de empréstimo | Tentar exemplar indisponível ou livro arquivado | Existirem exemplar indisponível e livro arquivado | Seleções correspondentes | Iniciar fluxo e avançar | Recurso não pode ser emprestado | — | Não executado |
| CT-EMP-003 | Regra de leitor | Tentar emprestar para leitor suspenso/bloqueado | Existir leitor não regular | Leitor suspenso ou bloqueado | Iniciar e tentar selecionar/confirmar | Empréstimo bloqueado sem alterar acervo | — | Não executado |
| CT-EMP-004 | Datas | Informar empréstimo futuro ou devolução não posterior | Fluxo aberto | Data futura; data igual/anterior | Informar e confirmar | Datas rejeitadas; empréstimo não criado | — | Não executado |

### 5.4 Devoluções

| ID | Funcionalidade | Cenário de teste | Pré-condições | Dados de entrada | Passos de execução | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|---|---|---|
| CT-DEV-001 | Devolução | Devolver empréstimo ativo com data válida | Empréstimo pendente e exemplar emprestado | Data não futura e não anterior ao empréstimo | Registrar devolução e confirmar | Empréstimo finalizado; exemplar disponível; histórico atualizado | Teste RTL abriu a primeira devolução pendente, informou `2026-11-04` e confirmou; o modal fechou e a aba Histórico ficou disponível. A disponibilidade interna do exemplar não foi observada diretamente. | Aprovado |
| CT-DEV-002 | Validação | Informar data futura ou anterior ao empréstimo | Empréstimo pendente | Cada data inválida | Tentar confirmar | Devolução rejeitada e estado preservado | — | Não executado |
| CT-DEV-003 | Devolução repetida | Devolver empréstimo finalizado ou exemplar incompatível | Existir histórico e dados incompatíveis | Empréstimo finalizado; exemplar divergente | Tentar registrar | Operação bloqueada sem duplicar histórico ou liberar exemplar incorreto | — | Não executado |

### 5.5 Histórico

| ID | Funcionalidade | Cenário de teste | Pré-condições | Dados de entrada | Passos de execução | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|---|---|---|
| CT-HIS-001 | Histórico de devoluções | Consultar movimentação após devolução | Existir devolução registrada | Aba Histórico | Registrar/selecionar devolução; abrir Histórico | Movimento mostra livro, leitor, exemplar e data; não fica pendente | Após a devolução, o teste RTL abriu Histórico e encontrou o movimento associado ao exemplar `EX-008`. | Aprovado |
| CT-HIS-002 | Histórico de relatórios | Filtrar movimentos por tipo e período | Existirem movimentos em datas distintas | Empréstimo/Devolução e período | Abrir Relatórios; aba Histórico; filtrar | Só eventos compatíveis aparecem, ordenados e coerentes | — | Não executado |

### 5.6 Relatórios

| ID | Funcionalidade | Cenário de teste | Pré-condições | Dados de entrada | Passos de execução | Resultado esperado | Resultado obtido | Status |
|---|---|---|---|---|---|---|---|---|
| CT-REL-001 | Catálogo | Filtrar por disponibilidade e arquivamento | Existirem livros em estados distintos | Filtros de categoria, disponibilidade e arquivamento | Abrir Relatórios; selecionar Catálogo; filtrar | Tabela e indicadores refletem apenas títulos compatíveis | — | Não executado |
| CT-REL-002 | Empréstimos/devoluções | Filtrar por status, leitor, livro e período | Existirem registros distintos | Filtros combinados | Selecionar filtros e consultar | Resultado atende simultaneamente a todos os filtros | — | Não executado |
| CT-REL-003 | Exportação | Exportar consulta filtrada em CSV | Consulta com registro | Filtros aplicados | Executar exportação | CSV contém cabeçalho, linhas filtradas e campos escapados | — | Não executado |

## 6. Execução e evidências

Os casos aprovados nesta atualização foram executados por testes de interface reais com React Testing Library e `userEvent`, em `frontend/src/pages/__tests__/pages.integration.test.tsx`, com `localStorage` limpo por caso. Os 21 testes Jest da suíte completa não equivalem automaticamente aos 23 casos do plano; somente os cenários reproduzidos foram classificados. **Aprovado** exige resultado observado igual ao esperado; **Reprovado**, divergência; **Bloqueado**, impedimento; **Não executado**, caso ainda não realizado. Uma execução futura deve registrar data, método e evidência observável.

## 7. Matriz de rastreabilidade

| Requisito funcional | Funcionalidade | Casos relacionados | Teste automatizado existente |
|---|---|---|---|
| Livro exige dados básicos e ISBN válido/único | Livros | CT-LIV-001, 002, 003 | `frontend/src/context/__tests__/validation.test.ts` — `valida e normaliza ISBN-10 e ISBN-13`; `frontend/src/context/__tests__/LibraryContext.integration.test.tsx` — `cadastra, edita e exclui livro sem empréstimos`; `bloqueia ISBN duplicado, leitor inválido e leitor duplicado` |
| Quantidade/disponibilidade permanecem consistentes | Livros/exemplares | CT-LIV-004, 006, CT-EMP-001, CT-DEV-001 | `frontend/src/context/__tests__/LibraryContext.integration.test.tsx` — `empresta exemplar disponível, atualiza disponibilidade e devolve`; `persiste estado no localStorage e impede alterações perigosas` |
| Livro com histórico não é excluído definitivamente | Livros | CT-LIV-007 | `frontend/src/context/__tests__/LibraryContext.integration.test.tsx` — `persiste estado no localStorage e impede alterações perigosas` |
| Leitor exige nome, identificador único e contatos válidos | Leitores | CT-LEI-001, 002, 003, 004 | `frontend/src/pages/__tests__/pages.integration.test.tsx` — `ReadersPage cadastra leitor válido e mostra validação de campo obrigatório`; `frontend/src/context/__tests__/validation.test.ts` — `aceita campos de contato vazios e rejeita formatos inválidos`; `LibraryContext.integration.test.tsx` — `bloqueia ISBN duplicado, leitor inválido e leitor duplicado` |
| Apenas leitor regular pode receber empréstimo | Empréstimos | CT-EMP-003 | `frontend/src/context/__tests__/LibraryContext.integration.test.tsx` — `bloqueia ISBN duplicado, leitor inválido e leitor duplicado` |
| Apenas exemplar disponível de livro ativo pode ser emprestado | Empréstimos | CT-EMP-001, 002 | `frontend/src/pages/__tests__/pages.integration.test.tsx` — `LoansPage realiza empréstimo pelo fluxo de quatro etapas`; `LibraryContext.integration.test.tsx` — `empresta exemplar disponível, atualiza disponibilidade e devolve` |
| Datas de empréstimo/devolução prevista são válidas | Empréstimos | CT-EMP-004 | Não identificado |
| Devolução exige empréstimo aberto, exemplar compatível e data válida | Devoluções | CT-DEV-001, 002, 003 | `frontend/src/domain/__tests__/returnRules.test.ts` — `resolve exemplar vinculado e rejeita divergência`; `aplica devolução e libera o exemplar`; `bloqueia devolução quando exemplar não está emprestado` |
| Devolução finaliza empréstimo e libera exemplar | Devoluções/histórico | CT-DEV-001, CT-HIS-001 | `frontend/src/pages/__tests__/pages.integration.test.tsx` — `ReturnsPage registra devolução e atualiza a aba de histórico`; `LibraryContext.integration.test.tsx` — `empresta exemplar disponível, atualiza disponibilidade e devolve` |
| Relatórios derivam status, histórico, períodos e CSV | Relatórios | CT-HIS-002, CT-REL-001, 002, 003 | `frontend/src/domain/__tests__/reporting.test.ts` — `deriva status ativo, atrasado e devolvido`; `identifica devolução atrasada e ordena movimentos`; `escapa CSV e filtra períodos` |

## 8. Resumo executivo

| Indicador | Quantidade |
|---|---:|
| Casos planejados | 23 |
| Casos executados | 6 |
| Aprovados | 6 |
| Reprovados | 0 |
| Bloqueados | 0 |
| Não executados | 17 |

Principais riscos: ausência de execução manual registrada; caminhos visuais de edição/exclusão e filtros ainda não cobertos por testes de página; dependência de `localStorage`, sem backend ou concorrência multiusuário; e possível divergência entre regras do contexto e apresentação visual. A análise atual confirmou que `BooksPage` possui formulário e ações de cadastro/edição/exclusão/arquivamento; a limitação documental anterior foi corrigida aqui.

## 9. Preparação para apresentação — aproximadamente 5 minutos

1. **Abertura (40 s):** caixa preta verifica ações, entradas e resultados visíveis, sem avaliar o código interno.
2. **Tabela (50 s):** explicar ID, pré-condições, dados, passos, esperado e obtido; enfatizar que “Não executado” não é “Aprovado”.
3. **Cadastro (60 s):** apresentar CT-LEI-001 e CT-LEI-002, com nome/matrícula/e-mail válidos e nome vazio ou e-mail inválido.
4. **Circulação (70 s):** demonstrar CT-EMP-001 e CT-DEV-001, observando disponível → emprestado → devolvido.
5. **Consulta (60 s):** demonstrar CT-LIV-005 ou CT-REL-002, aplicando busca e filtros.
6. **Fechamento (40 s):** resultado esperado é definido antes; resultado obtido só é preenchido após observar a aplicação. Mostrar a execução de um caso e sua evidência.

## 10. Limitações e revisão

Não foram criados casos para autenticação, concorrência, backend ou recuperação de dados, pois não há fluxo funcional comprovado no frontend analisado. O plano deve ser revisado para cada nova funcionalidade relevante, mudança de regra, remoção de caso ou alteração de nome/arquivo de teste. A matriz deve permanecer sincronizada com requisitos e testes automatizados.
