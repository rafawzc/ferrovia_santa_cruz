from typing import Protocol


class LinhasRepo(Protocol):
    def listar(self) -> list[dict]: ...


class LinhasService:
    def __init__(self, repo: LinhasRepo):
        self.repo = repo

    def listar(self) -> list[dict]:
        return self.repo.listar()
