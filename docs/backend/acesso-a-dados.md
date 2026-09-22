# Backend — acesso a dados (SQL puro)

> Referenciado pelo `.claude/CLAUDE.md` (P0 *SQL sempre parametrizado* + seção Backend). A regra dura mora no CLAUDE.md; o como-fazer mora aqui.

## Decisão: SQL puro, sem ORM

O acesso ao MySQL é **SQL cru** via `mysql-connector-python`. Sem SQLAlchemy, sem ORM, sem query-builder. É decisão de projeto (ver [`../decisoes/stack.md`](../decisoes/stack.md)) — respeite, por mais tentador que seja adicionar uma camada.

A contrapartida de não ter ORM: **você** é o responsável pela segurança e pela organização que o ORM daria de graça. Por isso as regras abaixo não são opcionais.

## Regra nº 1 — toda query parametrizada

TODA query que recebe valor vindo de fora (request, query param, path param, body, header) usa placeholders parametrizados. NUNCA f-string, concatenação ou `.format()` montando SQL.

✅ **Certo** — placeholder `%s`, valores num tuple separado:

```python
cursor.execute("SELECT * FROM trem WHERE linha_id = %s", (linha_id,))
```

❌ **Errado** — SQL injection na veia:

```python
cursor.execute(f"SELECT * FROM trem WHERE linha_id = {linha_id}")
cursor.execute("SELECT * FROM trem WHERE linha_id = " + str(linha_id))
```

Vale **inclusive** pra "query interna que ninguém chama de fora" — o hábito é o que protege; abrir exceção é como o furo entra.

Placeholders só valem pra **valores**, não pra identificadores (nome de tabela/coluna). Se precisar de nome de tabela dinâmico (raro), valide contra uma allowlist fixa antes — nunca interpole input direto.

## Regra nº 2 — conexão centralizada

Não abra `mysql.connector.connect(...)` cru espalhado pelo código. O ponto único é **`backend/app/db.py`** (o arquivo real, inteiro):

```python
import os
from contextlib import contextmanager
from functools import cache

from mysql.connector import pooling


@cache
def _pool():
    return pooling.MySQLConnectionPool(
        pool_name="ferrovia",
        pool_size=5,
        host=os.environ["DB_HOST"],
        user=os.environ["MYSQL_USER"],
        password=os.environ["MYSQL_PASSWORD"],
        database=os.environ["MYSQL_DATABASE"],
    )


@contextmanager
def cursor():
    conn = _pool().get_connection()
    try:
        with conn.cursor(dictionary=True) as cur:
            yield cur
        conn.commit()
    finally:
        conn.close()
```

- **Pool preguiçoso** (`@cache`): só conecta na primeira query. Por isso importar o `app` nos testes não precisa de banco.
- **Env:** `DB_HOST` (`db`, o nome do serviço na rede interna), `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD` — `DB_HOST` vem do `environment:` do compose, o resto do `.env`. Nada chumbado.
- **`cursor()` é a única porta:** devolve cursor `dictionary=True` (linha vira `dict`), faz `commit` se o bloco terminar sem erro e **sempre** devolve a conexão pro pool (`close()` num pooled = devolver). Erro no meio → sem commit; o pool reseta a sessão quando a conexão volta (o que não foi commitado é descartado).

## Regra nº 3 — sempre fechar cursor e conexão

Garantido pelo `cursor()` acima — nunca pegue conexão do pool na mão. Um repositório real (`backend/app/repositories/linhas.py`):

```python
from app.db import cursor


class LinhasMySQL:
    def listar(self):
        with cursor() as cur:
            cur.execute("SELECT id, numero, status, ativo FROM linha ORDER BY numero")
            return cur.fetchall()
```

Com parâmetro: `cur.execute("... WHERE u.id = %s", (id_,))`. Com vários campos, placeholder nomeado + `dict` (também parametrizado): `cur.execute("INSERT ... VALUES (%(nome)s, %(email)s)", dados)`.

Conflito de integridade (e-mail duplicado, FK pra nada) **não** é tratado no repo: o `IntegrityError` sobe e o handler do `main.py` responde `409`. Ver [`api.md`](api.md).

## Regra nº 4 — validar na fronteira com Pydantic

Input chega validado pelos models Pydantic do FastAPI antes de tocar o banco. Erro de validação → 4xx automático com mensagem clara, nunca 500 silencioso. O Pydantic é sua primeira linha; o SQL parametrizado é a segunda.

## Regra nº 5 — segredos via ambiente

Senha do MySQL e afins vêm de variável de ambiente / `.env` gitignored. Nunca hardcoded no código. Ver `NEVER` no CLAUDE.md raiz.

## Onde o SQL mora — camada `repositories/`

O backend é em camadas (L21 do plano da fundação): `routers/` (só HTTP) → `services/` (regra, Python puro) → `repositories/` (SQL). **SQL só existe em `repositories/`**, e o repo é fino: só a query, nenhuma regra. Todo recurso passa pelas três: o router depende só do service; o service declara o repo como `typing.Protocol` (sem regra = só repassa); qual classe MySQL atende cada `Protocol` é decidido num lugar só, `backend/app/deps.py`. Detalhe em [`../../backend/CLAUDE.md`](../../backend/CLAUDE.md).

## Testes — banco mockado

Decisão travada (L16): **sem banco de teste**. Testes usam pytest + `TestClient` e trocam o repositório por um fake via `app.dependency_overrides[deps.<recurso>_repo]` (fakes em `backend/tests/fakes.py`, com a mesma interface dos repos reais — inclusive levantando o mesmo `IntegrityError`). Rodar: `./fsc test`.

Preço disso: o SQL nunca executa em teste — coluna errada ou erro de sintaxe só aparece rodando de verdade. Compensação: repo fino (quase nada pra errar além da query) e um **smoke manual contra o banco de dev** (`./fsc up` + chamar o endpoint, ou conferir a query no `./fsc db`) antes de fechar qualquer feature que toque SQL.
