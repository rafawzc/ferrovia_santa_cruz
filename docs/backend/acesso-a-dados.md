# Backend — acesso a dados (SQL puro)

> Referenciado pelo `.claude/CLAUDE.md` (P0 *SQL sempre parametrizado* + seção Backend). A regra dura mora no CLAUDE.md; o como-fazer mora aqui.

## Decisão: SQL puro, sem ORM

O acesso ao MySQL é **SQL cru** via `mysql-connector-python`. Sem SQLAlchemy, sem ORM, sem query-builder. É decisão de projeto (ver [`../decisoes/stack.md`](../decisoes/stack.md)) — respeite, por mais tentador que seja adicionar uma camada.

A contrapartida de não ter ORM: **você** é o responsável pela segurança e pela organização que o ORM daria de graça. Por isso as regras abaixo não são opcionais.

## Regra nº 1 — toda query parametrizada

TODA query que recebe valor vindo de fora (request, query param, path param, body, header) usa placeholders parametrizados. NUNCA f-string, concatenação ou `.format()` montando SQL.

```python
# ✅ CERTO — placeholder %s, valores num tuple separado
cursor.execute("SELECT * FROM trens WHERE estacao_id = %s", (estacao_id,))

# ❌ ERRADO — SQL injection na veia
cursor.execute(f"SELECT * FROM trens WHERE estacao_id = {estacao_id}")
cursor.execute("SELECT * FROM trens WHERE estacao_id = " + str(estacao_id))
```

Vale **inclusive** pra "query interna que ninguém chama de fora" — o hábito é o que protege; abrir exceção é como o furo entra.

Placeholders só valem pra **valores**, não pra identificadores (nome de tabela/coluna). Se precisar de nome de tabela dinâmico (raro), valide contra uma allowlist fixa antes — nunca interpole input direto.

## Regra nº 2 — conexão centralizada

Não abra `mysql.connector.connect(...)` cru espalhado pelo código. Centralize a conexão/pool num único módulo e consuma de lá. Isso dá um ponto único pra config (host `db`, credenciais via env), pool e troubleshooting.

```python
# db.py — ponto único de conexão
import mysql.connector
from mysql.connector import pooling

pool = pooling.MySQLConnectionPool(
    pool_name="ferrovia",
    pool_size=5,
    host="db",                       # hostname do serviço na rede interna
    user=os.environ["MYSQL_USER"],
    password=os.environ["MYSQL_PASSWORD"],   # SEMPRE via env, nunca hardcoded
    database=os.environ["MYSQL_DATABASE"],
)

def get_conn():
    return pool.get_connection()
```

## Regra nº 3 — sempre fechar cursor e conexão

Use context manager (`with`) pra garantir que cursor e conexão fecham mesmo se der exceção. Conexão vazada esgota o pool e derruba a API.

```python
def listar_trens(estacao_id: int):
    with get_conn() as conn:
        with conn.cursor(dictionary=True) as cursor:
            cursor.execute("SELECT * FROM trens WHERE estacao_id = %s", (estacao_id,))
            return cursor.fetchall()
```

## Regra nº 4 — validar na fronteira com Pydantic

Input chega validado pelos models Pydantic do FastAPI antes de tocar o banco. Erro de validação → 4xx automático com mensagem clara, nunca 500 silencioso. O Pydantic é sua primeira linha; o SQL parametrizado é a segunda.

## Regra nº 5 — segredos via ambiente

Senha do MySQL e afins vêm de variável de ambiente / `.env` gitignored. Nunca hardcoded no código. Ver `NEVER` no CLAUDE.md raiz.

## Testes

Prefira testar contra um **banco de teste real** (schema descartável ou transação revertida por teste) em vez de mockar o cursor. Mockar `cursor.execute` testa o mock, não o seu SQL — e SQL é exatamente o que pode estar errado aqui. Detalhe no `/tdd` skill (seção *Mocking — Boundaries Only*).
