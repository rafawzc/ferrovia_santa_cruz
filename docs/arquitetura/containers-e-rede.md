# Arquitetura de containers e rede

> Referenciado pelo `.claude/CLAUDE.md` (seção Arquitetura). Aqui vive o detalhe completo; o CLAUDE.md guarda só a regra firme + o ponteiro pra cá.

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

## Rede

- Só o `frontend` tem `ports:` publicado (`5173:5173` em dev).
- `backend` e `db` vivem numa rede `internal` sem porta exposta — alcançáveis só pelo nome do serviço (`backend`, `db`) dentro do compose.
- `backend` fala com o MySQL pelo hostname `db` na rede interna.

## Ordem de inicialização — `depends_on` em cadeia

`db` sobe primeiro → `backend` depende de `db` → `frontend` depende de `backend`. Ordem garantida: **`db → backend → frontend`**.

Use `depends_on` com `condition: service_healthy`, **não** `depends_on` cru. Motivo: `depends_on` cru só espera o container *iniciar*, não ficar *pronto*. O MySQL demora segundos a aceitar conexões depois do container subir — sem healthcheck, o backend tenta conectar antes do banco aceitar e quebra no boot.

```yaml
# esqueleto do compose (a montar quando o código existir)
services:
  db:
    image: mysql:8
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 5s
      timeout: 3s
      retries: 10
    networks: [internal]        # sem ports:
  backend:
    depends_on:
      db:
        condition: service_healthy
    networks: [internal]        # sem ports:
    # opcional: healthcheck batendo num /health da API
  frontend:
    depends_on:
      backend:
        condition: service_started   # ou service_healthy se o backend expuser /health
    ports: ["5173:5173"]        # único serviço exposto
    networks: [internal]
networks:
  internal:
```

## Checklist ao mexer aqui

- [ ] Backend e db continuam sem `ports:` publicado?
- [ ] Front chama API por caminho relativo `/api/...` (zero URL absoluta de backend)?
- [ ] `depends_on` mantém a cadeia `db → backend → frontend` com `service_healthy` onde faz sentido?
- [ ] Healthcheck do `db` cobre o tempo até o MySQL aceitar conexão?
