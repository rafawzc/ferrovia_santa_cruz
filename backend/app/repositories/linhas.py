from app.db import cursor

SELECT_LINHA = "SELECT id, numero, origem, destino, status, ativo FROM linha"


class LinhasMySQL:
    def listar(self, filtros):
        onde = " WHERE status = %(status)s" if filtros["status"] is not None else ""
        with cursor() as cur:
            cur.execute(SELECT_LINHA + onde + " ORDER BY numero", filtros)
            return cur.fetchall()

    def por_id(self, linha_id):
        with cursor() as cur:
            cur.execute(SELECT_LINHA + " WHERE id = %s", (linha_id,))
            return cur.fetchone()

    def criar(self, linha):
        with cursor() as cur:
            cur.execute(
                """
                INSERT INTO linha (numero, origem, destino, status, ativo)
                VALUES (%(numero)s, %(origem)s, %(destino)s, %(status)s, %(ativo)s)
                """,
                linha,
            )
            cur.execute(SELECT_LINHA + " WHERE id = %s", (cur.lastrowid,))
            return cur.fetchone()

    def atualizar(self, linha_id, linha):
        with cursor() as cur:
            cur.execute(
                """
                UPDATE linha SET
                    numero = COALESCE(%(numero)s, numero),
                    origem = COALESCE(%(origem)s, origem),
                    destino = COALESCE(%(destino)s, destino),
                    status = COALESCE(%(status)s, status),
                    ativo = COALESCE(%(ativo)s, ativo)
                WHERE id = %(id)s
                """,
                {**linha, "id": linha_id},
            )

    def remover(self, linha_id):
        with cursor() as cur:
            cur.execute("DELETE FROM linha WHERE id = %s", (linha_id,))
