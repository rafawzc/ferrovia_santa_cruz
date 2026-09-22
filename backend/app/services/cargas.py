from typing import Protocol


class CargasRepo(Protocol):
    def listar(self) -> list[dict]: ...
    def criar(self, dados: dict) -> dict: ...


class CargasService:
    def __init__(self, repo: CargasRepo):
        self.repo = repo

    def listar(self) -> list[dict]:
        return self.repo.listar()

    def criar(self, dados: dict) -> dict:
        return self.repo.criar(dados)
