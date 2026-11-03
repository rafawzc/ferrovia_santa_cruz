from app.db import cursor

SELECT_TREM = """
    SELECT t.id, t.prefixo, t.modelo, t.ano, t.capacidade_t, t.status, t.ultima_inspecao,
           t.linha_id, l.numero AS linha_numero, COUNT(s.id) AS total_sensores
    FROM trem t
    LEFT JOIN linha l ON l.id = t.linha_id
    LEFT JOIN sensor s ON s.trem_id = t.id
"""
AGRUPA_TREM = " GROUP BY t.id, l.numero"
POR_ID = " WHERE t.id = %(id)s"


def _buscar(cur, trem_id):
    cur.execute(SELECT_TREM + POR_ID + AGRUPA_TREM, {"id": trem_id})
    return cur.fetchone()


class TrensMySQL:
    def listar(self, busca, status):
        condicoes, params = [], {}
        if busca is not None:
            condicoes.append("(t.prefixo LIKE %(busca)s OR t.modelo LIKE %(busca)s)")
            params["busca"] = f"%{busca}%"
        if status is not None:
            condicoes.append("t.status = %(status)s")
            params["status"] = status
        onde = " WHERE " + " AND ".join(condicoes) if condicoes else ""
        with cursor() as cur:
            cur.execute(SELECT_TREM + onde + AGRUPA_TREM + " ORDER BY t.prefixo", params)
            return cur.fetchall()

    def por_id(self, trem_id):
        with cursor() as cur:
            return _buscar(cur, trem_id)

    def criar(self, trem):
        with cursor() as cur:
            cur.execute(
                """
                INSERT INTO trem (prefixo, modelo, ano, capacidade_t, status, ultima_inspecao,
                                  linha_id)
                VALUES (%(prefixo)s, %(modelo)s, %(ano)s, %(capacidade_t)s, %(status)s,
                        %(ultima_inspecao)s, %(linha_id)s)
                """,
                trem,
            )
            return _buscar(cur, cur.lastrowid)

    def atualizar(self, trem_id, trem):
        with cursor() as cur:
            cur.execute(
                """
                UPDATE trem SET
                    prefixo = COALESCE(%(prefixo)s, prefixo),
                    modelo = COALESCE(%(modelo)s, modelo),
                    ano = COALESCE(%(ano)s, ano),
                    capacidade_t = COALESCE(%(capacidade_t)s, capacidade_t),
                    status = COALESCE(%(status)s, status),
                    ultima_inspecao = COALESCE(%(ultima_inspecao)s, ultima_inspecao),
                    linha_id = COALESCE(%(linha_id)s, linha_id)
                WHERE id = %(id)s
                """,
                {**trem, "id": trem_id},
            )

    def excluir(self, trem_id):
        with cursor() as cur:
            cur.execute("DELETE FROM trem WHERE id = %s", (trem_id,))
