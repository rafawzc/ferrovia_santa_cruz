from typing import Protocol


class DashboardRepo(Protocol):
    def metricas(self) -> dict: ...


class DashboardService:
    def __init__(self, repo: DashboardRepo):
        self.repo = repo

    def metricas(self) -> dict:
        return self.repo.metricas()
