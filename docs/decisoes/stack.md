# Decisões de stack

> Registro das decisões técnicas tomadas, com o *porquê*. Referenciado pelo `.claude/CLAUDE.md`. Quando uma decisão mudar, **não apague** — marque a antiga como superada e adicione a nova embaixo, pra manter o histórico do raciocínio.

Formato: cada decisão tem contexto, o que foi decidido, e a consequência. Datas em absoluto.

---

## D1 — Backend: FastAPI (API REST)

**Data:** 2026-06-02 · **Status:** vigente

**Contexto:** backend em Python servindo um frontend React + dashboard. Precisa entregar JSON pro front (admin e cliente).

**Decisão:** FastAPI. API REST, endpoints sob `/api/...`.

**Consequência:** async, validação e docs OpenAPI/Swagger automáticas via Pydantic. O front consome via proxy do Vite. Models Pydantic viram a fronteira de validação de input.

---

## D2 — Banco: MySQL com SQL puro (sem ORM)

**Data:** 2026-06-02 · **Status:** vigente

**Contexto:** persistência num MySQL. A escolha natural seria um ORM (SQLAlchemy) pela segurança e produtividade.

**Decisão:** **SQL cru** via `mysql-connector-python`. Sem ORM, sem query-builder, sem camada por cima.

**Porquê (não-óbvio):** a decisão é **política, não técnica** — a professora avaliadora reclama de "qualquer camada por cima" do SQL. Como é uma SA avaliada por ela, o critério dela manda aqui.

**Consequência:** ganhamos a aprovação dela e SQL explícito/didático; perdemos a rede de segurança do ORM. Compensação obrigatória: **toda query parametrizada** (anti SQL-injection), conexão centralizada, cursores sempre fechados. Detalhe em [`../backend/acesso-a-dados.md`](../backend/acesso-a-dados.md). Virou P0 no CLAUDE.md raiz.

---

## D3 — Frontend: React + Vite, testes com Vitest

**Data:** 2026-06-02 · **Status:** React + Vite vigente · **Vitest + Testing Library superado em 2026-09-22 → [`frontend-e-qualidade.md`](frontend-e-qualidade.md) (F5: sem testes de front)**. Estilo e linguagem do front (Tailwind v4, TypeScript strict, shadcn) também decididos lá.

**Contexto:** SPA responsiva (desktop + mobile), dois lados (admin e cliente).

**Decisão:** React com **Vite** pra dev/build e **Vitest** + Testing Library pros testes.

**Consequência:** dev server rápido com HMR; o `server.proxy` do Vite é o que faz o front chamar o backend internamente (ver D4). Stack React moderna padrão.

---

## D4 — Infra: Docker Compose, 3 containers, rede interna, só frontend exposto

**Data:** 2026-06-02 · **Status:** vigente

**Contexto:** requisito de empacotar tudo em containers com isolamento.

**Decisão:** `docker-compose.yml` com 3 serviços — `frontend`, `backend`, `db` — conectados só por **rede interna**. **Apenas o `frontend` é exposto** pra fora; ele faz proxy `/api → backend` internamente. `depends_on` em cadeia `db → backend → frontend` com `condition: service_healthy`.

**Porquê:** isolamento (backend e banco nunca acessíveis de fora) e boa prática de segurança. A cadeia de `depends_on` com healthcheck evita o backend subir antes do MySQL aceitar conexão.

**Consequência:** o front **nunca** usa URL absoluta de backend — sempre `/api/...` relativo, senão o isolamento cai. Detalhe completo em [`../arquitetura/containers-e-rede.md`](../arquitetura/containers-e-rede.md).

---

## D5 — Documentação: `docs/` profundidade 2 + CLAUDE.mds espalhados

**Data:** 2026-06-02 · **Status:** vigente

**Contexto:** SA de ano inteiro, várias atividades — desorganização mata o projeto a longo prazo.

**Decisão:** `docs/` com índice em `docs/CLAUDE.md`, profundidade final de 2 (`docs/<area-geral>/<subtema>/arquivo.md`), primeira camada com poucas pastas amplas. Em paralelo, `CLAUDE.md` procedurais espalhados pelo codebase. Step de documentação obrigatório no fechamento de toda implementação.

**Consequência:** o detalhe verboso sai do CLAUDE.md raiz e vira doc granular referenciada fortemente — o agente lê o resumo + ponteiro no CLAUDE.md e decide se precisa abrir o detalhe. Virou P0 (*Documentar ao fechar*) no CLAUDE.md raiz.

---

## D6 — Script de operação: `fsc.py` em Python (biblioteca padrão), não bash

**Data:** 2026-11-06 · **Status:** vigente (substitui o `fsc` em bash)

**Contexto:** o `fsc` era um script bash, então só rodava em Linux e macOS. Colegas no Windows precisariam de Git Bash ou WSL só pra subir o projeto. Além disso, a saída crua do `docker compose` era longa e, quando faltava Docker, a mensagem de erro não dizia o que fazer.

**Decisão:** a porta única de operação virou `fsc.py`, em Python 3.10+ usando só a biblioteca padrão. Roda como `python3 fsc.py <comando>` (Linux/macOS, ou `./fsc.py`) e `python fsc.py <comando>` (Windows). Faz checagens antes de agir (Docker instalado, rodando, plugin Compose) e, quando algo falta, diz em uma linha o que fazer. No `up` ele resolve a porta do frontend em vez de exigir a 5173: reusa a porta do container que já está rodando ou toma a primeira livre de 5173 a 5192, grava em `PORTA_FRONTEND` no `.env` (o compose substitui em `${PORTA_FRONTEND:-5173}:5173`) e imprime o endereço real — a 5173 ocupada por outro programa não trava mais ninguém. Os comandos longos mostram uma linha por passo; `-v`/`--verboso` mostra a saída inteira. Mensagens em português. Spec: [`../tasks/lowh-fsc-multiplataforma-2026-11-06.md`](../tasks/lowh-fsc-multiplataforma-2026-11-06.md).

**Porquê:** um arquivo só, igual em qualquer sistema, sem instalar Git Bash. Python já vem na maioria das máquinas e não há nada pra `pip install`.

**Alternativas descartadas:** bash + um `fsc.cmd` de lançamento (ainda exige Git Bash no Windows); porta em PowerShell (duas cópias da mesma lógica pra manter em sincronia).

**Consequência:** o host passa a precisar de Python 3.10+, exceção registrada ao "nada de python do host" — ele serve só pra rodar o `fsc.py`; node, npm, backend e banco continuam só nos containers. O CI roda `python3 fsc.py check`.
