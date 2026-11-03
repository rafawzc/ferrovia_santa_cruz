from app.db import cursor

CONSULTAS = {
    "desempenho": """
        SELECT t.prefixo AS trem_prefixo,
               CAST(AVG(l.valor) AS DOUBLE) AS velocidade_media,
               CAST(MAX(l.valor) AS DOUBLE) AS velocidade_maxima
          FROM leitura_sensor l
          JOIN sensor s ON s.id = l.sensor_id
          JOIN trem t ON t.id = s.trem_id
         WHERE s.tipo_dado = 'velocidade'
           AND l.data_hora >= %(inicio)s
           AND l.data_hora < %(fim)s + INTERVAL 1 DAY
           AND (%(trem_id)s IS NULL OR t.id = %(trem_id)s)
         GROUP BY t.id, t.prefixo
         ORDER BY t.prefixo
    """,
    "consumo": """
        SELECT t.prefixo AS trem_prefixo,
               CAST(SUM(l.valor) AS DOUBLE) AS consumo_total,
               CAST(AVG(l.valor) AS DOUBLE) AS consumo_medio
          FROM leitura_sensor l
          JOIN sensor s ON s.id = l.sensor_id
          JOIN trem t ON t.id = s.trem_id
         WHERE s.tipo_dado = 'energia'
           AND l.data_hora >= %(inicio)s
           AND l.data_hora < %(fim)s + INTERVAL 1 DAY
           AND (%(trem_id)s IS NULL OR t.id = %(trem_id)s)
         GROUP BY t.id, t.prefixo
         ORDER BY t.prefixo
    """,
    "eficiencia": """
        SELECT t.prefixo AS trem_prefixo,
               CAST(SUM(CASE WHEN v.status = 'concluida' THEN 1 ELSE 0 END) AS SIGNED)
                   AS concluidas,
               CAST(SUM(CASE WHEN v.status = 'cancelada' THEN 1 ELSE 0 END) AS SIGNED)
                   AS canceladas,
               CAST(SUM(CASE WHEN v.status = 'atrasada' THEN 1 ELSE 0 END) AS SIGNED)
                   AS atrasadas
          FROM viagem v
          JOIN trem t ON t.id = v.trem_id
         WHERE v.partida_prevista >= %(inicio)s
           AND v.partida_prevista < %(fim)s + INTERVAL 1 DAY
           AND (%(trem_id)s IS NULL OR t.id = %(trem_id)s)
         GROUP BY t.id, t.prefixo
         ORDER BY t.prefixo
    """,
    "manutencao": """
        SELECT t.prefixo AS trem_prefixo,
               COUNT(*) AS total_alertas,
               CAST(SUM(CASE WHEN a.severidade = 'critico' THEN 1 ELSE 0 END) AS SIGNED)
                   AS criticos,
               CAST(SUM(CASE WHEN a.severidade = 'atencao' THEN 1 ELSE 0 END) AS SIGNED)
                   AS atencao,
               CAST(SUM(CASE WHEN a.severidade = 'normal' THEN 1 ELSE 0 END) AS SIGNED)
                   AS normais,
               t.ultima_inspecao
          FROM alerta a
          JOIN leitura_sensor l ON l.id = a.leitura_id
          JOIN sensor s ON s.id = l.sensor_id
          JOIN trem t ON t.id = s.trem_id
         WHERE a.criado_em >= %(inicio)s
           AND a.criado_em < %(fim)s + INTERVAL 1 DAY
           AND (%(trem_id)s IS NULL OR t.id = %(trem_id)s)
         GROUP BY t.id, t.prefixo, t.ultima_inspecao
         ORDER BY t.prefixo
    """,
}


class RelatoriosMySQL:
    def agregar(self, tipo, periodo):
        with cursor() as cur:
            cur.execute(CONSULTAS[tipo], periodo)
            return cur.fetchall()
