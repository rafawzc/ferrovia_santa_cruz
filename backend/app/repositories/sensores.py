from app.db import cursor

SELECT_SENSOR = """
    SELECT s.id, s.codigo, s.nome, s.tipo_dado, s.localizacao, s.segmento, s.trem_id,
           t.prefixo AS trem_prefixo, t.modelo AS trem_modelo,
           ul.status_operacional AS ultima_leitura_status,
           ul.valor AS ultima_leitura_valor,
           ul.data_hora AS ultima_leitura_data
    FROM sensor s
    JOIN trem t ON t.id = s.trem_id
    LEFT JOIN leitura_sensor ul ON ul.id = (
        SELECT ultima.id
        FROM leitura_sensor ultima
        WHERE ultima.sensor_id = s.id
        ORDER BY ultima.data_hora DESC, ultima.id DESC
        LIMIT 1
    )
"""
POR_ID = " WHERE s.id = %(id)s"


def _buscar(cur, sensor_id):
    cur.execute(SELECT_SENSOR + POR_ID, {"id": sensor_id})
    return cur.fetchone()


class SensoresMySQL:
    def listar(self, tipo, trem_id):
        condicoes, params = [], {}
        if tipo is not None:
            condicoes.append("s.tipo_dado = %(tipo)s")
            params["tipo"] = tipo
        if trem_id is not None:
            condicoes.append("s.trem_id = %(trem_id)s")
            params["trem_id"] = trem_id
        onde = " WHERE " + " AND ".join(condicoes) if condicoes else ""
        with cursor() as cur:
            cur.execute(SELECT_SENSOR + onde + " ORDER BY t.prefixo, s.codigo", params)
            return cur.fetchall()

    def por_id(self, sensor_id):
        with cursor() as cur:
            return _buscar(cur, sensor_id)

    def criar(self, sensor):
        with cursor() as cur:
            cur.execute(
                """
                INSERT INTO sensor (codigo, nome, tipo_dado, localizacao, segmento, trem_id)
                VALUES (%(codigo)s, %(nome)s, %(tipo_dado)s, %(localizacao)s, %(segmento)s,
                        %(trem_id)s)
                """,
                sensor,
            )
            return _buscar(cur, cur.lastrowid)

    def atualizar(self, sensor_id, sensor):
        with cursor() as cur:
            cur.execute(
                """
                UPDATE sensor SET
                    codigo = COALESCE(%(codigo)s, codigo),
                    nome = COALESCE(%(nome)s, nome),
                    tipo_dado = COALESCE(%(tipo_dado)s, tipo_dado),
                    localizacao = COALESCE(%(localizacao)s, localizacao),
                    segmento = COALESCE(%(segmento)s, segmento),
                    trem_id = COALESCE(%(trem_id)s, trem_id)
                WHERE id = %(id)s
                """,
                {**sensor, "id": sensor_id},
            )

    def excluir(self, sensor_id):
        with cursor() as cur:
            cur.execute("DELETE FROM sensor WHERE id = %s", (sensor_id,))
