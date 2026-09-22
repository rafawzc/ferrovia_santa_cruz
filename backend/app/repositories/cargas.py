from app.db import cursor

SELECT_CARGA = """
    SELECT id, tipo, peso_t, local_partida, destino, vagao, trem_id, criado_em FROM carga
"""


class CargasMySQL:
    def listar(self):
        with cursor() as cur:
            cur.execute(SELECT_CARGA + " ORDER BY criado_em DESC, id DESC")
            return cur.fetchall()

    def criar(self, dados):
        with cursor() as cur:
            cur.execute(
                """
                INSERT INTO carga (tipo, peso_t, local_partida, destino, vagao, trem_id)
                VALUES (%(tipo)s, %(peso_t)s, %(local_partida)s, %(destino)s, %(vagao)s,
                        %(trem_id)s)
                """,
                dados,
            )
            cur.execute(SELECT_CARGA + " WHERE id = %s", (cur.lastrowid,))
            return cur.fetchone()
