from app.db import cursor

SELECT_VIAGEM = """
    SELECT v.id, v.linha_id, l.numero AS linha_numero, l.origem, l.destino,
           v.trem_id, t.prefixo AS trem_prefixo, v.partida_prevista, v.chegada_prevista,
           v.status, v.criado_em
    FROM viagem v
    JOIN linha l ON l.id = v.linha_id
    JOIN trem t ON t.id = v.trem_id
"""
FILTROS = {
    "status": "v.status = %(status)s",
    "trem_id": "v.trem_id = %(trem_id)s",
    "linha_id": "v.linha_id = %(linha_id)s",
    "data": "v.partida_prevista >= %(data)s AND v.partida_prevista < %(data)s + INTERVAL 1 DAY",
}


class ViagensMySQL:
    def listar(self, filtros):
        usados = [sql for campo, sql in FILTROS.items() if filtros[campo] is not None]
        onde = " WHERE " + " AND ".join(usados) if usados else ""
        with cursor() as cur:
            cur.execute(SELECT_VIAGEM + onde + " ORDER BY v.partida_prevista DESC", filtros)
            return cur.fetchall()

    def por_id(self, viagem_id):
        with cursor() as cur:
            cur.execute(SELECT_VIAGEM + " WHERE v.id = %s", (viagem_id,))
            return cur.fetchone()

    def criar(self, viagem):
        with cursor() as cur:
            cur.execute(
                """
                INSERT INTO viagem (linha_id, trem_id, partida_prevista, chegada_prevista, status)
                VALUES (%(linha_id)s, %(trem_id)s, %(partida_prevista)s, %(chegada_prevista)s,
                        %(status)s)
                """,
                viagem,
            )
            cur.execute(SELECT_VIAGEM + " WHERE v.id = %s", (cur.lastrowid,))
            return cur.fetchone()

    def atualizar(self, viagem_id, viagem):
        with cursor() as cur:
            cur.execute(
                """
                UPDATE viagem SET
                    linha_id = COALESCE(%(linha_id)s, linha_id),
                    trem_id = COALESCE(%(trem_id)s, trem_id),
                    partida_prevista = COALESCE(%(partida_prevista)s, partida_prevista),
                    chegada_prevista = COALESCE(%(chegada_prevista)s, chegada_prevista),
                    status = COALESCE(%(status)s, status)
                WHERE id = %(id)s
                """,
                {**viagem, "id": viagem_id},
            )

    def remover(self, viagem_id):
        with cursor() as cur:
            cur.execute("DELETE FROM viagem WHERE id = %s", (viagem_id,))
