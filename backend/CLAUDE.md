# Backend — FastAPI + SQL puro

Leia antes: `docs/backend/acesso-a-dados.md` (regras de SQL) e o plano `docs/tasks/lowh-fundacao-design-system-2026-09-22.md` (L7, L16, L21, L26).

## O que vive aqui

Contrato HTTP de cada endpoint: [`../docs/backend/api.md`](../docs/backend/api.md). Aqui é o *como está montado*.

```
app/main.py            FastAPI(), registra os routers num laço, handler IntegrityError → 409, /api/health
app/db.py              pool único (lazy, @cache) + cursor() context manager: commit no fim, sempre devolve a conexão
app/core/security.py   argon2 (pwdlib) + JWT HS256 (PyJWT). Lê JWT_SECRET do env na hora de usar.
app/core/auth.py       usuario_atual (lê cookie 'sessao', recarrega o usuário do banco) + exige_papel(*papeis)
app/routers/           só HTTP: Pydantic entra/sai, status, guard. Um arquivo por recurso.
app/services/          regra em Python puro (sem FastAPI, sem mysql). Hoje só usuarios.py.
app/repositories/      SQL puro. Uma classe <Recurso>MySQL por recurso, métodos finos.
tests/fakes.py         repos em memória com a MESMA interface dos <Recurso>MySQL
tests/conftest.py      client (todas as overrides), como(id) (loga com cookie forjado)
scripts/check_comments.py  checagem de "zero comentários" (L7)
```

## Camadas como ficaram (L21)

- **Router → repo direto quando não há regra** (`linhas`, `cargas`, `alertas`, `dashboard`): service que só repassa chamada é wrapper sem valor. O router depende da classe do repo.
- **Router → service → repo quando há regra** (`auth`, `usuarios`): hash de senha, "e-mail inexistente custa o mesmo tempo que senha errada", desativado não loga, 404 antes do UPDATE. O service declara o repo como `typing.Protocol` (`services/usuarios.py::UsuariosRepo`) e não importa nada de FastAPI/mysql.
- **A classe do repo É a dependência.** `repo: Annotated[UsuariosMySQL, Depends()]` → o FastAPI instancia a classe; nos testes `app.dependency_overrides[UsuariosMySQL] = lambda: fake`. Sem função `get_repo`.
- **Erro de integridade não é tratado no repo nem no service**: o `mysql.connector.errors.IntegrityError` sobe e o handler do `main.py` responde 409 (`1062` → "Registro duplicado", `1452` → "Referência inexistente"). Os fakes levantam o mesmo `IntegrityError` com o mesmo `errno` (`fakes.duplicado()`, `fakes.sem_referencia()`).
- **Guard por papel** no `APIRouter(dependencies=[Depends(exige_papel(...))])`, não em cada rota. Sem cookie → 401 (`usuario_atual`), papel errado → 403.
- O papel **não** vem do JWT: `usuario_atual` relê o usuário pelo `sub` a cada request. Desativar/trocar cargo vale na hora.

## Como adicionar um endpoint

1. **RED:** teste em `tests/test_<recurso>.py` usando `como(GESTAO|OPERACIONAL|CLIENTE)` e/ou `client` (anônimo). Cubra sucesso, 401, 403, 422 e 404/409 se couber.
2. Fake novo em `tests/fakes.py` com os mesmos métodos do repo real; registre em `conftest.py::client` (`app.dependency_overrides[XMySQL] = ...`). Fake com estado → instancie uma vez e sobrescreva com `lambda: instancia` (senão cada request pega um fake novo).
3. **GREEN:** `repositories/<recurso>.py` (classe `XMySQL`, `with cursor() as cur`, `%s`/`%(nome)s`), `routers/<recurso>.py` (Pydantic + guard), regra só se existir → `services/`. Inclua o módulo no laço do `main.py`.
4. INSERT que precisa devolver a linha: faça o `SELECT ... WHERE id = %s` com `cur.lastrowid` **no mesmo `cursor()`** (mesma conexão/transação).
5. **Smoke real (R1):** o SQL nunca roda em teste. Suba a stack e chame via curl pelo proxy (ver abaixo) antes de fechar.
6. Atualize `docs/backend/api.md`.

## Gotchas de SQL (achados no smoke)

- `BOOLEAN` volta como `0/1`: o `bool` do Pydantic converte na saída. `DECIMAL` volta `Decimal`: campo `float` no model converte.
- `COALESCE(%(x)s, DEFAULT(cargo_id))` no INSERT deixa o **banco** decidir o cargo padrão (cadastro público → `comum`). Não chumbe `1` no Python.
- PATCH parcial é `SET col = COALESCE(%(col)s, col)`: SQL estático, sem montar SET dinâmico. Preço: `null` não apaga campo.
- INSERT que falha com 409 **queima** o `AUTO_INCREMENT` (InnoDB). Não assuma id sequencial em smoke.
- `DB_HOST` vem do `environment:` do compose (é o nome do serviço, não segredo), não do `.env`. `JWT_SECRET` < 32 bytes só gera warning do PyJWT, mas troque.

## Smoke contra o banco real sem derrubar outra stack

Outra worktree pode estar usando a porta 5173. Suba um projeto separado com outra porta publicada (override com `ports: !override ["5199:5173"]`):

```bash
HOST_UID=$(id -u) HOST_GID=$(id -g) docker compose -p fsc-api-smoke -f docker-compose.yml -f override.yml up -d --build --wait
curl -c jar -H 'Content-Type: application/json' -d '{"email":"ana.admin@ferrovia.com","senha":"ferrovia123"}' localhost:5199/api/auth/login
curl -b jar localhost:5199/api/usuarios
HOST_UID=$(id -u) HOST_GID=$(id -g) docker compose -p fsc-api-smoke -f docker-compose.yml -f override.yml down -v
```

`-p` diferente = volume próprio, banco recém-seedado.

## IoT — espaço reservado (L22/L23)

Ingestão **não** existe ainda. Quando vier (`POST /api/leituras`, auth por API key do sensor), cabe sem mexer em nada que existe:

- `repositories/leituras.py` (`LeiturasMySQL.criar`) — `leitura_sensor.sensor_id` é FK: sensor inexistente já vira 409 pelo handler global.
- `services/leituras.py` se houver regra (ex: derivar `status_operacional`), com `Protocol` do repo.
- `routers/leituras.py` com uma dependência própria de API key **no lugar** de `usuario_atual` — o cookie/JWT é só pra gente, sensor não loga.
- `./fsc sim` (simulador) roda dentro do container `backend` e bate na mesma URL que o device real.

## Venv em `/opt/venv`, não em `/app/.venv`

`/app` é bind mount do `./backend` no compose. Venv dentro de `/app` seria apagado/sombreado pelo mount. Por isso `UV_PROJECT_ENVIRONMENT=/opt/venv`, instalado no build com `uv sync --frozen` (inclui o grupo dev: pytest, httpx, ruff) e `chmod a+rX` porque o container roda com o UID do host. `/opt/venv/bin` está no `PATH`: `pytest`, `ruff`, `uvicorn` rodam direto. `uv run` também funciona (`UV_CACHE_DIR=/tmp/uv-cache` porque o UID do host não tem HOME no container).

Mudou dependência → `uv add --no-sync` num container descartável e **rebuild** (`./fsc build`). O venv não é escrevível em runtime, e `./fsc sh backend`/`compose run` não servem: o `backend` só está na rede `internal` (sem internet). Use a imagem já buildada com a rede padrão do docker:

```bash
docker run --rm --user $(id -u):$(id -g) -e HOME=/tmp -e UV_CACHE_DIR=/tmp/uv \
  -v $PWD/backend:/app -w /app <imagem-do-backend> uv add --no-sync <pacote>
```

## Comandos (via `./fsc`, na raiz)

- `./fsc test` → `pytest`
- `./fsc lint be` → `ruff check .` + `python scripts/check_comments.py` (o `ruff format --check .` só roda no `./fsc check`)
- `./fsc fmt` → `ruff format .`

## Checagem de comentários (L7)

`python scripts/check_comments.py [caminhos...]` (padrão: `app tests scripts`). Usa `tokenize`, então `#` dentro de string não conta. Falha com `arquivo:linha` pra qualquer comentário, exceto shebang na linha 1 e comentários contendo `noqa`, `type: ignore` ou `pragma`. Ignora `.venv`. Recebe **pastas** (usa `rglob`); passar um arquivo solto não varre nada.
