# Plano de testes

## Caixa preta

Testar ISBN válido/inválido/duplicado; código de exemplar duplicado; leitor suspenso; 0, 2, 3 e 4 empréstimos ativos; exemplar disponível/emprestado; prazo de 14 dias; devolução repetida; atraso; arquivamento com empréstimo ativo. Usar equivalência e valores-limite e guardar evidências em `tests/evidencias/`.

## Caixa branca

Cobrir todos os ramos dos serviços de empréstimo/devolução: suspensão, limite 3, disponibilidade, devolução repetida e commit/rollback. Medir linhas e branches com Coverlet; frontend com Vitest e fluxos com Playwright.
