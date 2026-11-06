from typing import Protocol


class SensoresRepo(Protocol):
    def listar(self, tipo: str | None, trem_id: int | None) -> list[dict]: ...
    def por_id(self, sensor_id: int) -> dict | None: ...
    def criar(self, sensor: dict) -> dict: ...
    def atualizar(self, sensor_id: int, sensor: dict) -> None: ...
    def excluir(self, sensor_id: int) -> None: ...


class SensoresService:
    def __init__(self, repo: SensoresRepo):
        self.repo = repo

    def listar(self, tipo: str | None, trem_id: int | None) -> list[dict]:
        return self.repo.listar(tipo, trem_id)

    def por_id(self, sensor_id: int) -> dict | None:
        return self.repo.por_id(sensor_id)

    def criar(self, sensor: dict) -> dict:
        return self.repo.criar(sensor)

    def atualizar(self, sensor_id: int, sensor: dict) -> dict | None:
        if self.repo.por_id(sensor_id) is None:
            return None
        self.repo.atualizar(sensor_id, sensor)
        return self.repo.por_id(sensor_id)

    def excluir(self, sensor_id: int) -> bool:
        if self.repo.por_id(sensor_id) is None:
            return False
        self.repo.excluir(sensor_id)
        return True
