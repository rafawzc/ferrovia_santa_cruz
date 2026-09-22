from app.db import cursor

SELECT_ALERTA = """
    SELECT a.id, a.linha_id, l.numero AS linha_numero, a.tempo_espera, a.motivo, a.status,
           a.criado_em
    FROM alerta a
    JOIN linha l ON l.id = a.linha_id
"""


class AlertasMySQL:
    def listar(self):
        with cursor() as cur:
            cur.execute(SELECT_ALERTA + " ORDER BY a.criado_em DESC, a.id DESC")
            return cur.fetchall()

    def criar(self, dados):
        with cursor() as cur:
            cur.execute(
                """
                INSERT INTO alerta (linha_id, tempo_espera, motivo, status)
                VALUES (%(linha_id)s, %(tempo_espera)s, %(motivo)s, %(status)s)
                """,
                dados,
            )
            cur.execute(SELECT_ALERTA + " WHERE a.id = %s", (cur.lastrowid,))
            return cur.fetchone()
