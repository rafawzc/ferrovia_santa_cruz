from typing import Protocol


class LinhasRepo(Protocol):
    def listar(self, filtros: dict) -> list[dict]: ...
    def por_id(self, linha_id: int) -> dict | None: ...
    def criar(self, linha: dict) -> dict: ...
    def atualizar(self, linha_id: int, linha: dict) -> None: ...
    def remover(self, linha_id: int) -> None: ...


class LinhasService:
    def __init__(self, repo: LinhasRepo):
        self.repo = repo

    def listar(self, filtros: dict) -> list[dict]:
        return self.repo.listar(filtros)

    def criar(self, linha: dict) -> dict:
        return self.repo.criar(linha)

    def atualizar(self, linha_id: int, linha: dict) -> dict | None:
        if self.repo.por_id(linha_id) is None:
            return None
        self.repo.atualizar(linha_id, linha)
        return self.repo.por_id(linha_id)

    def remover(self, linha_id: int) -> bool:
        if self.repo.por_id(linha_id) is None:
            return False
        self.repo.remover(linha_id)
        return True
