from app.db import cursor


class DashboardMySQL:
    def trens_por_status(self, trem_id):
        with cursor() as cur:
            cur.execute(
                """
                SELECT status, COUNT(*) AS quantidade
                  FROM trem
                 WHERE (%(trem_id)s IS NULL OR id = %(trem_id)s)
                 GROUP BY status
                 ORDER BY status
                """,
                {"trem_id": trem_id},
            )
            return cur.fetchall()

    def alertas_ativos_por_severidade(self, trem_id):
        with cursor() as cur:
            cur.execute(
                """
                SELECT a.severidade, COUNT(*) AS quantidade
                  FROM alerta a
                  LEFT JOIN leitura_sensor l ON l.id = a.leitura_id
                  LEFT JOIN sensor s ON s.id = l.sensor_id
                 WHERE NOT a.tratado
                   AND (%(trem_id)s IS NULL OR s.trem_id = %(trem_id)s)
                 GROUP BY a.severidade
                 ORDER BY a.severidade
                """,
                {"trem_id": trem_id},
            )
            return cur.fetchall()

    def sensores_criticos(self, trem_id):
        with cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) AS quantidade
                  FROM (SELECT l.status_operacional,
                               ROW_NUMBER() OVER (
                                   PARTITION BY l.sensor_id
                                   ORDER BY l.data_hora DESC, l.id DESC
                               ) AS posicao
                          FROM leitura_sensor l
                          JOIN sensor s ON s.id = l.sensor_id
                         WHERE (%(trem_id)s IS NULL OR s.trem_id = %(trem_id)s)) ultima
                 WHERE ultima.posicao = 1
                   AND ultima.status_operacional = 'falha'
                """,
                {"trem_id": trem_id},
            )
            return cur.fetchone()["quantidade"]

    def viagens_em_andamento(self, trem_id):
        with cursor() as cur:
            cur.execute(
                """
                SELECT COUNT(*) AS quantidade
                  FROM viagem
                 WHERE status = 'em_andamento'
                   AND (%(trem_id)s IS NULL OR trem_id = %(trem_id)s)
                """,
                {"trem_id": trem_id},
            )
            return cur.fetchone()["quantidade"]

    def velocidade_media(self, trem_id):
        with cursor() as cur:
            cur.execute(
                """
                SELECT ROUND(AVG(l.valor), 1) AS velocidade_media
                  FROM leitura_sensor l
                  JOIN sensor s ON s.id = l.sensor_id
                 WHERE s.tipo_dado = 'velocidade'
                   AND l.data_hora >= NOW() - INTERVAL 24 HOUR
                   AND (%(trem_id)s IS NULL OR s.trem_id = %(trem_id)s)
                """,
                {"trem_id": trem_id},
            )
            return cur.fetchone()["velocidade_media"]
