# Ferrovia Santa Cruz

Aplicação web de **gerenciamento** (lado admin) e **informação** (lado cliente e admin) sobre a ferrovia Santa Cruz. Dashboard, responsivo em desktop e mobile. Projeto desenvolvido como **SA (Situação de Aprendizagem)** de curso técnico, ao longo do ano letivo.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | React + Vite (testes com Vitest) |
| Backend | FastAPI — API REST em Python |
| Banco | MySQL (acesso via SQL puro, sem ORM) |
| Infra | Docker Compose — 3 containers |

## Arquitetura

Três containers conectados por uma **rede interna**. Só o `frontend` é exposto pra fora; ele chama o `backend` internamente por proxy, e o `backend` fala com o `db`.

```
Navegador  ──:5173──►  frontend  ──rede interna──►  backend  ──rede interna──►  db
                       (Vite, proxy /api)            (FastAPI)                   (MySQL)
                                                     sem porta exposta           sem porta exposta
```

Detalhe completo em [`docs/arquitetura/containers-e-rede.md`](docs/arquitetura/containers-e-rede.md).

## Como rodar

> Pré-requisito: Docker + Docker Compose.

```bash
docker compose up --build      # sobe db → backend → frontend (nessa ordem)
```

Acesse a aplicação em **http://localhost:5173**. As chamadas de API (`/api/...`) são repassadas internamente ao backend — não há porta de backend ou banco exposta.

### Testes

```bash
docker compose exec backend pytest          # backend
docker compose exec frontend npm run test   # frontend
```

## Estrutura

```
ferrovia_santa_cruz/
├── frontend/   # React + Vite — UI responsiva (admin + cliente)
├── backend/    # FastAPI — API REST, SQL puro pro MySQL
├── db/         # init/seed SQL do MySQL
├── docs/       # documentação do projeto (ver docs/CLAUDE.md)
└── .claude/    # configuração e instruções do agente de IA
```

## Documentação

A pasta [`docs/`](docs/) concentra a documentação do projeto. Comece pelo índice em [`docs/CLAUDE.md`](docs/CLAUDE.md). As decisões técnicas e seus porquês ficam em [`docs/decisoes/stack.md`](docs/decisoes/stack.md).
