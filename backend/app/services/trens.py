from typing import Protocol


class TrensRepo(Protocol):
    def listar(self, busca: str | None, status: str | None) -> list[dict]: ...
    def por_id(self, trem_id: int) -> dict | None: ...
    def criar(self, trem: dict) -> dict: ...
    def atualizar(self, trem_id: int, trem: dict) -> None: ...
    def excluir(self, trem_id: int) -> None: ...


class TrensService:
    def __init__(self, repo: TrensRepo):
        self.repo = repo

    def listar(self, busca: str | None, status: str | None) -> list[dict]:
        return self.repo.listar(busca, status)

    def por_id(self, trem_id: int) -> dict | None:
        return self.repo.por_id(trem_id)

    def criar(self, trem: dict) -> dict:
        return self.repo.criar(trem)

    def atualizar(self, trem_id: int, trem: dict) -> dict | None:
        if self.repo.por_id(trem_id) is None:
            return None
        self.repo.atualizar(trem_id, trem)
        return self.repo.por_id(trem_id)

    def excluir(self, trem_id: int) -> bool:
        if self.repo.por_id(trem_id) is None:
            return False
        self.repo.excluir(trem_id)
        return True
