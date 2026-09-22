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

Não abra `mysql.connector.connect(...)` cru espalhado pelo código. Centralize a conexão/pool num único módulo e consuma de lá. Isso dá um ponto único pra config (host `db`, credenciais via env), pool e troubleshooting.

Exemplo de `db.py` (ponto único de conexão). `host="db"` é o nome do serviço na rede interna; credenciais **sempre** do ambiente (o compose injeta o `.env`), nunca chumbadas:

```python
import os

from mysql.connector import pooling

pool = pooling.MySQLConnectionPool(
    pool_name="ferrovia",
    pool_size=5,
    host="db",
    user=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],
    database=os.environ["MYSQL_DATABASE"],
)

def get_conn():
    return pool.get_connection()
```

## Regra nº 3 — sempre fechar cursor e conexão

Use context manager (`with`) pra garantir que cursor e conexão fecham mesmo se der exceção. Conexão vazada esgota o pool e derruba a API.

```python
def listar_trens_da_linha(linha_id: int):
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM trem WHERE linha_id = %s", (linha_id,))
            return cursor.fetchall()
```

## Regra nº 4 — validar na fronteira com Pydantic

Input chega validado pelos models Pydantic do FastAPI antes de tocar o banco. Erro de validação → 4xx automático com mensagem clara, nunca 500 silencioso. O Pydantic é sua primeira linha; o SQL parametrizado é a segunda.

## Regra nº 5 — segredos via ambiente

Senha do MySQL e afins vêm de variável de ambiente / `.env` gitignored. Nunca hardcoded no código. Ver `NEVER` no CLAUDE.md raiz.

## Onde o SQL mora — camada `repositories/`

O backend é em camadas (L21 do plano da fundação): `routers/` (só HTTP) → `services/` (regra, Python puro) → `repositories/` (SQL). **SQL só existe em `repositories/`**, e o repo é fino: só a query, nenhuma regra. O service declara o repo que precisa como `typing.Protocol`. Detalhe em [`../../backend/CLAUDE.md`](../../backend/CLAUDE.md).

## Testes — banco mockado

Decisão travada (L16): **sem banco de teste**. Testes usam pytest + `TestClient` e trocam o repositório por um fake via `app.dependency_overrides`. Rodar: `./fsc test`.

Preço disso: o SQL nunca executa em teste — coluna errada ou erro de sintaxe só aparece rodando de verdade. Compensação: repo fino (quase nada pra errar além da query) e um **smoke manual contra o banco de dev** (`./fsc up` + chamar o endpoint, ou conferir a query no `./fsc db`) antes de fechar qualquer feature que toque SQL.
