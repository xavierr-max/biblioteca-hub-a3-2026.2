# Regras de negócio

## Leitores — Fase 3

- Nome e identificador são obrigatórios.
- Identificador é único sem diferenciação entre maiúsculas e minúsculas.
- E-mail vazio é permitido; quando preenchido, exige formato `usuario@dominio.extensão`.
- Telefone vazio é permitido; quando preenchido, aceita entre 8 e 13 dígitos após remover formatação.
- Novo leitor inicia como `REGULAR`; o status pode ser alterado para `SUSPENDED`, `BLOCKED` ou `REGULAR` pela API.
- Empréstimos, exclusão condicionada por histórico e contadores de empréstimos permanecem fora desta fase.

## Backend Fase 1

Livros e exemplares são persistidos; ISBN é validado, normalizado e único. Cadastro cria exemplares disponíveis, atualização não reduz abaixo dos emprestados e arquivamento é exposto pela API. Empréstimos/devoluções ainda não foram implementados no backend.

- ISBN-10 e ISBN-13 são validados por dígito de controle; hífens e espaços são removidos.
- Livro exige título, autor e ISBN válidos; ISBN duplicado não é aceito.
- A quantidade de exemplares não pode ser negativa. Reduções não removem exemplares emprestados.
- Livro com histórico de empréstimo não pode ser excluído definitivamente; pode ser arquivado.
- Leitor exige nome e identificador único; e-mail e telefone, quando informados, devem ser válidos.
- Leitor não regular não pode receber empréstimos.
- Apenas exemplares `AVAILABLE` podem ser emprestados; títulos arquivados não recebem novos empréstimos.
- Data do empréstimo não pode estar no futuro e a devolução prevista deve ser posterior.
- Devolução precisa referenciar empréstimo aberto, exemplar compatível e data não futura nem anterior ao empréstimo.
- Devolução marca o empréstimo como `RETURNED`, libera o exemplar e recalcula disponibilidade/quantidade de empréstimos do leitor.
- Um exemplar emprestado não pode ser manualmente marcado como disponível antes da devolução.
