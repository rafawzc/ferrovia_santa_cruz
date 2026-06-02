<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo-dark.svg">
    <source media="(prefers-color-scheme: light)" srcset="assets/logo-light.svg">
    <img alt="Ferrovia Santa Cruz" src="assets/logo-dark.svg" width="380">
  </picture>
</p>

<p align="center">
  <strong>Gestão e informação da ferrovia Santa Cruz — num só lugar.</strong>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=white&labelColor=20232a">
  <img alt="FastAPI" src="https://img.shields.io/badge/FastAPI-Python-009688?logo=fastapi&logoColor=white">
  <img alt="MySQL" src="https://img.shields.io/badge/MySQL-8-4479A1?logo=mysql&logoColor=white">
  <img alt="Docker" src="https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white">
</p>

---

Aplicação web para **gerenciar** (lado admin) e **informar** (lado cliente e admin) a ferrovia Santa Cruz — horários, trens, estações e um dashboard completo, funcionando igual de bem no desktop e no celular. Desenvolvida como **SA (Situação de Aprendizagem)** de curso técnico, ao longo do ano letivo.

## O que tem aqui

| Camada | Stack | O que faz |
|--------|-------|-----------|
| **Frontend** | React · Vite · Vitest | UI responsiva (mobile-first) — dashboard admin e telas de informação do cliente |
| **Backend** | FastAPI · Python | API REST sob `/api/...`, acesso ao banco em SQL puro |
| **Banco** | MySQL 8 | Persistência — schema e seed em `db/` |

Os três rodam em **Docker Compose**, ligados por uma **rede interna**. Só o `frontend` é exposto pra fora; ele chama o `backend` por proxy, e o `backend` fala com o `db` — nenhum dos dois publica porta.

```mermaid
%%{init: {'theme':'base','themeVariables':{
  'fontFamily':'ui-sans-serif, system-ui, sans-serif',
  'lineColor':'#8b9bb4',
  'clusterBkg':'#0d1117',
  'clusterBorder':'#3d4757'
}}}%%
flowchart LR
    browser["🖥️ Navegador<br/><i>fora da rede</i>"]
    subgraph internal["🔒 rede interna · Docker"]
        direction LR
        frontend["<b>frontend</b><br/>React · Vite<br/>proxy /api"]
        backend["<b>backend</b><br/>FastAPI<br/><i>sem porta exposta</i>"]
        db[("<b>db</b><br/>MySQL<br/><i>sem porta exposta</i>")]
    end
    browser -->|":5173"| frontend
    frontend -->|"/api → backend:8000"| backend
    backend -->|"SQL"| db

    classDef browser fill:#1e293b,stroke:#94a3b8,stroke-width:2px,color:#e2e8f0
    classDef front fill:#0b3a48,stroke:#61dafb,stroke-width:2px,color:#dff7ff
    classDef back fill:#0a3f38,stroke:#2dd4bf,stroke-width:2px,color:#d6fff7
    classDef data fill:#10243f,stroke:#5b9bd5,stroke-width:2px,color:#dbeafe
    class browser browser
    class frontend front
    class backend back
    class db data
```

Detalhe completo (proxy, `depends_on`, healthchecks) em [`docs/arquitetura/containers-e-rede.md`](docs/arquitetura/containers-e-rede.md).

## Como começar

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) com o plugin Compose
- Porta `5173` livre

### Subir o projeto

```bash
git clone https://github.com/rafawzc/ferrovia_santa_cruz.git && cd ferrovia_santa_cruz
docker compose up --build
```

O Compose sobe os serviços na ordem certa (`db → backend → frontend`) e espera o banco aceitar conexão antes do backend ligar. Quando terminar, abra **http://localhost:5173**.

As chamadas de API (`/api/...`) são repassadas internamente ao backend — não há porta de backend nem de banco exposta na sua máquina.

### Uso no dia a dia

```bash
docker compose up -d        # sobe em background
docker compose logs -f      # acompanha os logs
docker compose down         # derruba tudo
```

### Testes

```bash
docker compose exec backend pytest          # backend (pytest)
docker compose exec frontend npm run test   # frontend (Vitest)
```

## Estrutura do projeto

```
ferrovia_santa_cruz/
├── frontend/           # React + Vite — UI responsiva (admin + cliente)
├── backend/            # FastAPI — API REST, SQL puro pro MySQL
├── db/                 # init/seed SQL do MySQL
├── docs/               # documentação do projeto (ver docs/CLAUDE.md)
├── assets/             # mídia do README (logo)
├── docker-compose.yml  # 3 serviços: frontend, backend, db
└── .claude/            # configuração e instruções do agente de IA
```

## Documentação

A pasta [`docs/`](docs/CLAUDE.md) concentra toda a documentação — arquitetura, acesso a dados, responsividade e o registro de decisões. Comece pelo índice em [`docs/CLAUDE.md`](docs/CLAUDE.md); as decisões técnicas e seus porquês ficam em [`docs/decisoes/stack.md`](docs/decisoes/stack.md).
