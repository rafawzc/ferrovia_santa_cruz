from app.db import cursor

SELECT_ALERTA = """
    SELECT a.id, a.linha_id, l.numero AS linha_numero, a.leitura_id, a.tipo, a.severidade,
           a.tempo_espera, a.motivo, a.status, a.tratado, a.criado_em
    FROM alerta a
    LEFT JOIN linha l ON l.id = a.linha_id
"""
FILTROS = {
    "severidade": "a.severidade = %(severidade)s",
    "tipo": "a.tipo = %(tipo)s",
    "tratado": "a.tratado = %(tratado)s",
}


class AlertasMySQL:
    def listar(self, filtros):
        usados = [sql for campo, sql in FILTROS.items() if filtros[campo] is not None]
        onde = " WHERE " + " AND ".join(usados) if usados else ""
        with cursor() as cur:
            cur.execute(SELECT_ALERTA + onde + " ORDER BY a.criado_em DESC, a.id DESC", filtros)
            return cur.fetchall()

    def por_id(self, alerta_id):
        with cursor() as cur:
            cur.execute(SELECT_ALERTA + " WHERE a.id = %s", (alerta_id,))
            return cur.fetchone()

    def criar(self, alerta):
        with cursor() as cur:
            cur.execute(
                """
                INSERT INTO alerta (linha_id, tipo, severidade, tempo_espera, motivo, status)
                VALUES (%(linha_id)s, %(tipo)s, %(severidade)s, %(tempo_espera)s, %(motivo)s,
                        %(status)s)
                """,
                alerta,
            )
            cur.execute(SELECT_ALERTA + " WHERE a.id = %s", (cur.lastrowid,))
            return cur.fetchone()

    def marcar_tratado(self, alerta_id, tratado):
        with cursor() as cur:
            cur.execute("UPDATE alerta SET tratado = %s WHERE id = %s", (tratado, alerta_id))
