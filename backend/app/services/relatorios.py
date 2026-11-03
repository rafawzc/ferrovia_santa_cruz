from datetime import date
from typing import Protocol

COLUNA_DO_TREM = {"chave": "trem_prefixo", "rotulo": "Trem"}
RELATORIOS = {
    "desempenho": {
        "colunas": [
            COLUNA_DO_TREM,
            {"chave": "velocidade_media", "rotulo": "Velocidade média (km/h)"},
            {"chave": "velocidade_maxima", "rotulo": "Velocidade máxima (km/h)"},
        ],
        "grafico": {"rotulo": "Velocidade média por trem", "chave": "velocidade_media"},
    },
    "consumo": {
        "colunas": [
            COLUNA_DO_TREM,
            {"chave": "consumo_total", "rotulo": "Consumo total"},
            {"chave": "consumo_medio", "rotulo": "Consumo médio"},
        ],
        "grafico": {"rotulo": "Consumo total por trem", "chave": "consumo_total"},
    },
    "eficiencia": {
        "colunas": [
            COLUNA_DO_TREM,
            {"chave": "concluidas", "rotulo": "Concluídas"},
            {"chave": "canceladas", "rotulo": "Canceladas"},
            {"chave": "atrasadas", "rotulo": "Atrasadas"},
        ],
        "grafico": {"rotulo": "Viagens concluídas por trem", "chave": "concluidas"},
    },
    "manutencao": {
        "colunas": [
            COLUNA_DO_TREM,
            {"chave": "total_alertas", "rotulo": "Alertas"},
            {"chave": "criticos", "rotulo": "Críticos"},
            {"chave": "atencao", "rotulo": "Atenção"},
            {"chave": "normais", "rotulo": "Normais"},
            {"chave": "ultima_inspecao", "rotulo": "Última inspeção"},
        ],
        "grafico": {"rotulo": "Alertas por trem", "chave": "total_alertas"},
    },
}


class RelatoriosRepo(Protocol):
    def agregar(self, tipo: str, periodo: dict) -> list[dict]: ...


class RelatoriosService:
    def __init__(self, repo: RelatoriosRepo):
        self.repo = repo

    def gerar(self, tipo: str, inicio: date, fim: date, trem_id: int | None) -> dict:
        periodo = {"inicio": inicio, "fim": fim, "trem_id": trem_id}
        registros = self.repo.agregar(tipo, periodo)
        formato = RELATORIOS[tipo]
        chave = formato["grafico"]["chave"]
        return {
            **periodo,
            "tipo": tipo,
            "colunas": formato["colunas"],
            "linhas": registros,
            "grafico": {
                "rotulo": formato["grafico"]["rotulo"],
                "itens": [
                    {"rotulo": registro["trem_prefixo"], "valor": registro[chave]}
                    for registro in registros
                ],
            },
        }
