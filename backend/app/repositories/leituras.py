from app.db import cursor

SELECT_LEITURA = """
    SELECT l.id, l.sensor_id, s.codigo AS sensor_codigo, t.prefixo AS trem_prefixo,
           l.valor, l.status_operacional, l.data_hora
    FROM leitura_sensor l
    JOIN sensor s ON s.id = l.sensor_id
    JOIN trem t ON t.id = s.trem_id
"""


class LeiturasMySQL:
    def tipo_do_sensor(self, sensor_id):
        with cursor() as cur:
            cur.execute("SELECT tipo_dado FROM sensor WHERE id = %s", (sensor_id,))
            sensor = cur.fetchone()
            return sensor["tipo_dado"] if sensor else None

    def sensores(self):
        with cursor() as cur:
            cur.execute("SELECT id, tipo_dado FROM sensor ORDER BY id")
            return cur.fetchall()

    def criar(self, leitura, alerta):
        with cursor() as cur:
            cur.execute(
                """
                INSERT INTO leitura_sensor (sensor_id, valor, status_operacional)
                VALUES (%(sensor_id)s, %(valor)s, %(status_operacional)s)
                """,
                leitura,
            )
            leitura_id = cur.lastrowid
            alerta_id = None
            if alerta is not None:
                cur.execute(
                    """
                    INSERT INTO alerta (leitura_id, tipo, motivo, severidade, status, tratado)
                    VALUES (%(leitura_id)s, %(tipo)s, %(motivo)s, %(severidade)s, %(status)s, FALSE)
                    """,
                    {**alerta, "leitura_id": leitura_id},
                )
                alerta_id = cur.lastrowid
            cur.execute(
                """
                SELECT id, sensor_id, valor, status_operacional, data_hora
                FROM leitura_sensor WHERE id = %s
                """,
                (leitura_id,),
            )
            return {**cur.fetchone(), "alerta_id": alerta_id}

    def listar(self, sensor_id, limite):
        with cursor() as cur:
            cur.execute(
                SELECT_LEITURA
                + """
                WHERE %s IS NULL OR l.sensor_id = %s
                ORDER BY l.data_hora DESC, l.id DESC
                LIMIT %s
                """,
                (sensor_id, sensor_id, limite),
            )
            return cur.fetchall()
