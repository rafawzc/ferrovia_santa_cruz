from typing import Protocol


class ViagensRepo(Protocol):
    def listar(self, filtros: dict) -> list[dict]: ...
    def por_id(self, viagem_id: int) -> dict | None: ...
    def criar(self, viagem: dict) -> dict: ...
    def atualizar(self, viagem_id: int, viagem: dict) -> None: ...
    def remover(self, viagem_id: int) -> None: ...


class ViagensService:
    def __init__(self, repo: ViagensRepo):
        self.repo = repo

    def listar(self, filtros: dict) -> list[dict]:
        return self.repo.listar(filtros)

    def por_id(self, viagem_id: int) -> dict | None:
        return self.repo.por_id(viagem_id)

    def criar(self, viagem: dict) -> dict:
        return self.repo.criar(viagem)

    def atualizar(self, viagem_id: int, viagem: dict) -> dict | None:
        if self.repo.por_id(viagem_id) is None:
            return None
        self.repo.atualizar(viagem_id, viagem)
        return self.repo.por_id(viagem_id)

    def remover(self, viagem_id: int) -> bool:
        if self.repo.por_id(viagem_id) is None:
            return False
        self.repo.remover(viagem_id)
        return True
