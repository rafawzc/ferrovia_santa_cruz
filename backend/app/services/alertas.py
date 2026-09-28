from typing import Protocol


class AlertasRepo(Protocol):
    def listar(self) -> list[dict]: ...
    def criar(self, alerta: dict) -> dict: ...


class AlertasService:
    def __init__(self, repo: AlertasRepo):
        self.repo = repo

    def listar(self) -> list[dict]:
        return self.repo.listar()

    def criar(self, alerta: dict) -> dict:
        return self.repo.criar(alerta)
