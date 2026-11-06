from typing import Protocol


class DashboardRepo(Protocol):
    def trens_por_status(self, trem_id: int | None) -> list[dict]: ...
    def alertas_ativos_por_severidade(self, trem_id: int | None) -> list[dict]: ...
    def sensores_criticos(self, trem_id: int | None) -> int: ...
    def viagens_em_andamento(self, trem_id: int | None) -> int: ...
    def velocidade_media(self, trem_id: int | None) -> float | None: ...


class DashboardService:
    def __init__(self, repo: DashboardRepo):
        self.repo = repo

    def indicadores(self, usuario: dict) -> dict:
        if usuario["papel"] == "cliente":
            return {
                "trens_por_status": None,
                "alertas_ativos_por_severidade": None,
                "sensores_criticos": None,
                "viagens_em_andamento": self.repo.viagens_em_andamento(None),
                "velocidade_media": None,
            }
        if usuario["papel"] == "operacional" and usuario["trem_id"] is None:
            return {
                "trens_por_status": None,
                "alertas_ativos_por_severidade": None,
                "sensores_criticos": None,
                "viagens_em_andamento": 0,
                "velocidade_media": None,
            }
        trem_id = usuario["trem_id"] if usuario["papel"] == "operacional" else None
        return {
            "trens_por_status": self.repo.trens_por_status(trem_id),
            "alertas_ativos_por_severidade": self.repo.alertas_ativos_por_severidade(trem_id),
            "sensores_criticos": self.repo.sensores_criticos(trem_id),
            "viagens_em_andamento": self.repo.viagens_em_andamento(trem_id),
            "velocidade_media": self.repo.velocidade_media(trem_id),
        }
