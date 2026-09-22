# Backend — FastAPI + SQL puro

Leia antes: `docs/backend/acesso-a-dados.md` (regras de SQL) e o plano `docs/tasks/lowh-fundacao-design-system-2026-09-22.md` (L7, L16, L21, L26).

## O que vive aqui hoje

- `app/main.py` — o `FastAPI()` e `GET /api/health` (usado no healthcheck do compose).
- `tests/` — pytest + `TestClient`.
- `scripts/check_comments.py` — checagem de "zero comentários" (L7).
- `pyproject.toml` + `uv.lock` — deps (uv), config do ruff e do pytest num lugar só (L26).

## Camadas (L21) — criar só quando o primeiro endpoint real precisar

```
app/routers/       só HTTP: rota, Pydantic entra/sai, status code. Sem SQL, sem regra.
app/services/      regra de negócio em Python puro. Não importa FastAPI nem mysql.
app/repositories/  SQL puro parametrizado (%s + tuple). Nada de regra.
```

- O service declara o repo que precisa como um `typing.Protocol`; o repo real implementa.
- O router recebe o service/repo via `Depends`. Teste troca por fake com `app.dependency_overrides` (L16: banco mockado, sem banco de teste).
- Consequência (R1 do plano): SQL nunca roda em teste. Repo fino, só SQL; smoke manual contra o banco de dev antes de fechar.
- SQL **sempre** parametrizado. f-string / `+` / `.format()` montando SQL = reprovado.

## Venv em `/opt/venv`, não em `/app/.venv`

`/app` é bind mount do `./backend` no compose. Venv dentro de `/app` seria apagado/sombreado pelo mount. Por isso `UV_PROJECT_ENVIRONMENT=/opt/venv`, instalado no build com `uv sync --frozen` (inclui o grupo dev: pytest, httpx, ruff) e `chmod a+rX` porque o container roda com o UID do host. `/opt/venv/bin` está no `PATH`: `pytest`, `ruff`, `uvicorn` rodam direto. `uv run` também funciona (`UV_CACHE_DIR=/tmp/uv-cache` porque o UID do host não tem HOME no container).

Mudou dependência → `uv lock` dentro de container e **rebuild** da imagem. O venv não é escrevível em runtime.

## Comandos (via `./fsc`, na raiz)

- `./fsc test` → `pytest`
- `./fsc lint be` → `ruff check .` + `ruff format --check .` + `python scripts/check_comments.py`
- `./fsc fmt` → `ruff format .`

## Checagem de comentários (L7)

`python scripts/check_comments.py [caminhos...]` (padrão: `app tests scripts`). Usa `tokenize`, então `#` dentro de string não conta. Falha com `arquivo:linha` pra qualquer comentário, exceto shebang na linha 1 e comentários contendo `noqa`, `type: ignore` ou `pragma`. Ignora `.venv`. Recebe **pastas** (usa `rglob`); passar um arquivo solto não varre nada.
