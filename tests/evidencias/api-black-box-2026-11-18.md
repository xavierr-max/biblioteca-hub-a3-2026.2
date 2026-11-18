# Evidência de testes de caixa preta da API

Data: 18/11/2026
Base: MySQL 8.4 no Docker, banco `biblioteca`
Endpoint: `http://localhost:5180/api`

| Caso | Esperado | Resultado |
|---|---:|---|
| `GET /health` | HTTP 200 | PASS |
| `GET /books` | HTTP 200 e registros do banco | PASS - 5 livros |
| `GET /reservations` | HTTP 200 e registros do banco | PASS - 1 reserva |
| `GET /fines` | HTTP 200 e registros do banco | PASS - 1 multa |
| `POST /publishers` com nome duplicado | HTTP 409 | PASS |

Os testes foram executados contra a API em execução e contra o banco MySQL real, sem mocks de dados.

## Regras de negocio

| Caso | Esperado | Resultado |
|---|---:|---|
| Empréstimo para leitor suspenso | HTTP 400 | PASS |
| Empréstimo de exemplar já emprestado | HTTP 400 | PASS |
| Cadastro de ISBN duplicado | HTTP 409 | PASS |
| Empréstimo válido | HTTP 201 | PASS |
| Primeira devolução | HTTP 200 | PASS |
| Segunda devolução do mesmo empréstimo | HTTP 409 | PASS |

## Reservas e multas

| Caso | Esperado | Resultado |
|---|---:|---|
| Nova reserva válida | HTTP 201 | PASS |
| Reserva duplicada para leitor e livro | HTTP 409 | PASS |
| Multa com valor zero | HTTP 400 | PASS |
| Multa duplicada para o mesmo empréstimo | HTTP 409 | PASS |
