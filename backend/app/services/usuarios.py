from typing import Protocol

from app.core.security import hash_senha, verificar_senha


class UsuariosRepo(Protocol):
    def por_id(self, id_: int) -> dict | None: ...
    def por_email(self, email: str) -> dict | None: ...
    def listar(self) -> list[dict]: ...
    def listar_cargos(self) -> list[dict]: ...
    def criar(self, dados: dict) -> int: ...
    def atualizar(self, id_: int, dados: dict) -> None: ...
    def desativar(self, id_: int) -> None: ...


class CredenciaisInvalidas(Exception):
    pass


class UsuarioDesativado(Exception):
    pass


class SenhaAtualIncorreta(Exception):
    pass


_HASH_FALSO = hash_senha("iguala-o-tempo-de-resposta-de-email-inexistente")


class UsuariosService:
    def __init__(self, repo: UsuariosRepo):
        self.repo = repo

    def por_id(self, id_: int) -> dict | None:
        return self.repo.por_id(id_)

    def listar(self) -> list[dict]:
        return self.repo.listar()

    def listar_cargos(self) -> list[dict]:
        return self.repo.listar_cargos()

    def autenticar(self, email: str, senha: str) -> dict:
        usuario = self.repo.por_email(email)
        if usuario is None:
            verificar_senha(senha, _HASH_FALSO)
            raise CredenciaisInvalidas
        if not verificar_senha(senha, usuario["senha_hash"]):
            raise CredenciaisInvalidas
        if not usuario["ativo"]:
            raise UsuarioDesativado
        return usuario

    def cadastrar(self, nome: str, email: str, senha: str) -> dict:
        dados = {"nome": nome, "email": email, "senha": senha, "cargo_id": None, "telefone": None}
        return self.criar(dados)

    def criar(self, dados: dict) -> dict:
        return self.repo.por_id(self.repo.criar(_com_hash(dados)))

    def atualizar(self, id_: int, dados: dict) -> dict | None:
        if self.repo.por_id(id_) is None:
            return None
        self.repo.atualizar(id_, _com_hash(dados))
        return self.repo.por_id(id_)

    def atualizar_perfil(self, usuario: dict, dados: dict, senha_atual: str | None) -> dict:
        if dados["senha"] and not verificar_senha(senha_atual or "", usuario["senha_hash"]):
            raise SenhaAtualIncorreta
        return self.atualizar(usuario["id"], {**dados, "cargo_id": None, "ativo": None})

    def desativar(self, id_: int) -> bool:
        if self.repo.por_id(id_) is None:
            return False
        self.repo.desativar(id_)
        return True


def _com_hash(dados: dict) -> dict:
    senha = dados["senha"]
    sem_senha = {k: v for k, v in dados.items() if k != "senha"}
    return {**sem_senha, "senha_hash": hash_senha(senha) if senha else None}
