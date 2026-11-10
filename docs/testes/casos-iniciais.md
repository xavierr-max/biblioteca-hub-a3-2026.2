# Casos iniciais

| ID | Cenário | Resultado |
|---|---|---|
| CT-01 | Livro com ISBN válido | Criado |
| CT-02 | ISBN repetido | Rejeitado sem alteração |
| CT-03 | Leitor suspenso empresta | Rejeitado |
| CT-04 | Terceiro empréstimo ativo | Permitido |
| CT-05 | Quarto empréstimo ativo | Rejeitado |
| CT-06 | Segunda devolução | Rejeitada |
| CT-07 | Arquivar com empréstimo ativo | Rejeitado |
| CT-08 | Falha no meio da transação | Sem estado parcial |
