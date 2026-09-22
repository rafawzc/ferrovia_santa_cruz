# Arquitetura de containers e rede

> Referenciado pelo `.claude/CLAUDE.md` (seção Arquitetura). Aqui vive o detalhe completo; o CLAUDE.md guarda só a regra firme + o ponteiro pra cá. Descreve o `docker-compose.yml` **real** (fase 1, 2026-09-22). Como operar no dia a dia: [`operacao.md`](operacao.md).

## Requisito firme

Três containers, conectados **só por rede interna**. **Apenas o `frontend` é exposto** pra fora; ele chama o `backend` internamente. `backend` e `db` nunca têm porta publicada.

```
Navegador (você)  ──:5173──►  [frontend]  ──rede interna──►  [backend]  ──rede interna──►  [db]
   (fora da rede docker)      Vite dev server                FastAPI                       MySQL
                              proxy /api → backend:8000       SEM ports: publicado          SEM ports: publicado
```

## Por que o frontend precisa fazer proxy (e não só servir estáticos)

**React roda no navegador, e o navegador está FORA da rede docker.** Por isso "frontend chama backend internamente" exige que o *container* frontend faça **proxy**, não que sirva só arquivos estáticos jogados pro browser.

- Em **dev**, o Vite faz `server.proxy` de `/api/*` → `http://backend:8000`. O browser bate em `/api` no próprio frontend (porta 5173, a única exposta), e o Vite repassa pela rede interna até o backend.
- Em **prod** (se a SA exigir build de produção), o mesmo papel é feito por um nginx dentro do container frontend: serve o build do React e faz reverse-proxy de `/api/*` → `backend:8000`.

O frontend **nunca** usa URL absoluta do backend (`http://localhost:8000`). Sempre caminho relativo `/api/...`, que o proxy resolve. **Isso é o que mantém o backend não-exposto** — se o código do front apontasse pra `localhost:8000`, o backend teria que publicar porta e o requisito de isolamento cairia.

## Rede — duas redes, `internal` e `edge`

```yaml
networks:
  internal:
    internal: true
  edge:
```

- **`internal`** (`internal: true`) — rede sem saída pra fora. `db` e `backend` vivem **só** nela: sem `ports:`, alcançáveis só pelo nome do serviço (`db`, `backend`). O backend fala com o MySQL pelo hostname `db`.
- **`edge`** — rede comum (bridge), com saída. Só o `frontend` está nela.
- **Por que o `frontend` precisa das duas:** numa rede `internal: true` o Docker não publica porta pro host nem deixa sair pra internet. O front precisa (1) publicar a `5173` pro seu navegador e (2) baixar pacotes no `npm install` — isso é a `edge`. E precisa (3) chegar no `backend` pra fazer o proxy de `/api` — isso é a `internal`. Backend e db não precisam de nada disso, então ficam trancados.

## Ordem de inicialização — `depends_on` em cadeia

`db` sobe primeiro → `backend` depende de `db` → `frontend` depende de `backend`. Ordem garantida: **`db → backend → frontend`**, sempre com `condition: service_healthy`.

Use `depends_on` com `condition: service_healthy`, **não** `depends_on` cru. Motivo: `depends_on` cru só espera o container *iniciar*, não ficar *pronto*. O MySQL demora segundos a aceitar conexões depois do container subir — sem healthcheck, o backend tenta conectar antes do banco aceitar e quebra no boot.

## O compose real, serviço a serviço

Arquivo: [`docker-compose.yml`](../../docker-compose.yml) na raiz. Você não roda ele direto: o [`./fsc`](operacao.md) exporta `HOST_UID`/`HOST_GID` e cria o `.env` antes.

### `db` — `mysql:8.4`

- **Healthcheck por TCP em `127.0.0.1`:** `mysqladmin ping -h 127.0.0.1 -u"$MYSQL_USER" -p"$MYSQL_PASSWORD"`. Durante o init (primeira subida, rodando `schema.sql`/`seed.sql`), o entrypoint do MySQL sobe um servidor **temporário só com socket**, sem rede. Com `-h localhost` o ping vai pelo socket e responde "ok" já nesse servidor temporário → o backend subiria achando que o banco está pronto e ele reiniciaria logo depois. Com `127.0.0.1` o ping vai por TCP, que só existe no servidor final.
- **Collation pelo `command:`** — `--character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci`. Antes ela vinha do `CREATE DATABASE` do `schema.sql`, que saiu (o banco agora nasce do `MYSQL_DATABASE`). Sem o `command:`, o banco pegaria o default do MySQL 8.4 (`utf8mb4_0900_ai_ci`).
- **Init:** `db/schema.sql` e `db/seed.sql` montados em `/docker-entrypoint-initdb.d/` (`01-`, `02-`). Rodam **uma vez**, com o volume `db_data` vazio. Mudou o SQL → `./fsc db:reset`.
- Credenciais vêm do `.env` (interpoladas no compose). Sem `ports:`.

### `backend` — imagem do `backend/Dockerfile`

- `python:3.13-slim` + **`uv` instalado via `pip`** (`pip install "uv==0.9.*"`). O jeito comum (`COPY --from=ghcr.io/astral-sh/uv`) puxa imagem do `ghcr.io`, e isso faz o Docker consultar o credential helper da máquina atrás de login do ghcr — ponto de falha no build à toa. Via `pip` vem do PyPI, sem credencial.
- **Venv em `/opt/venv`**, não em `/app/.venv`: o `./backend` é bind mount em `/app` e sombrearia o venv. Instalado no build (`uv sync --frozen`); mudou dependência → rebuild.
- Roda com o **UID/GID do host** (`user:`), então arquivo criado dentro do container (cache, lock) fica seu, não do root.
- `uvicorn --reload` — editou `.py`, recarrega sozinho.
- Healthcheck: `python` batendo em `http://127.0.0.1:8000/api/health`. É ele que libera o `frontend`.
- `env_file: .env`. Sem `ports:`.

### `frontend` — `node:24-slim` direto, sem Dockerfile

- Não tem imagem própria: usa `node:24-slim` e monta `./frontend` inteiro em `/app`. O `command:` roda `npm install` e `npm run dev`.
- Roda com o **UID/GID do host** + `HOME=/tmp` (o seu UID não tem home dentro do container). Assim o `node_modules` e o `package-lock.json` escritos pelo container ficam **seus** no host — o editor enxerga os tipos e o lint sem você instalar node na máquina.
- Porta `5173:5173` — a **única** publicada. O Vite faz o proxy `/api → http://backend:8000`.
- Redes `internal` + `edge` (ver acima).

## Checklist ao mexer aqui

- [ ] Backend e db continuam sem `ports:` publicado?
- [ ] Front chama API por caminho relativo `/api/...` (zero URL absoluta de backend)?
- [ ] `depends_on` mantém a cadeia `db → backend → frontend` com `service_healthy` onde faz sentido?
- [ ] Healthcheck do `db` cobre o tempo até o MySQL aceitar conexão (TCP em `127.0.0.1`, não `localhost`)?
- [ ] `backend` e `db` continuam só na rede `internal`? Só o `frontend` na `edge`?
- [ ] Serviço com bind mount roda com `user: "${HOST_UID}:${HOST_GID}"` (senão cria arquivo como root no host)?
