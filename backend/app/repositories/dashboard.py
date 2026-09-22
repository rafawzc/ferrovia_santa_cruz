from app.db import cursor


class DashboardMySQL:
    def metricas(self):
        with cursor() as cur:
            cur.execute(
                """
                SELECT
                    (SELECT COUNT(*) FROM linha WHERE ativo) AS linhas_ativas,
                    (SELECT COUNT(*) FROM linha WHERE status = 'manutencao')
                        AS linhas_em_manutencao,
                    (SELECT COUNT(*) FROM sensor) AS sensores,
                    (SELECT AVG(l.valor)
                       FROM leitura_sensor l
                       JOIN sensor s ON s.id = l.sensor_id
                      WHERE s.tipo_dado = 'velocidade') AS velocidade_media
                """
            )
            return cur.fetchone()
