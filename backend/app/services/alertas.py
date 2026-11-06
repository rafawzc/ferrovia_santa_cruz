from typing import Protocol


class AlertasRepo(Protocol):
    def listar(self, filtros: dict) -> list[dict]: ...
    def por_id(self, alerta_id: int) -> dict | None: ...
    def criar(self, alerta: dict) -> dict: ...
    def marcar_tratado(self, alerta_id: int, tratado: bool) -> None: ...


class AlertasService:
    def __init__(self, repo: AlertasRepo):
        self.repo = repo

    def listar(self, filtros: dict) -> list[dict]:
        return self.repo.listar(filtros)

    def criar(self, alerta: dict) -> dict:
        return self.repo.criar(alerta)

    def marcar_tratado(self, alerta_id: int, tratado: bool) -> dict | None:
        if self.repo.por_id(alerta_id) is None:
            return None
        self.repo.marcar_tratado(alerta_id, tratado)
        return self.repo.por_id(alerta_id)
