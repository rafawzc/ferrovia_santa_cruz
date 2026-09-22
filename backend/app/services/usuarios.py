from typing import Protocol

from app.core.security import hash_senha, verificar_senha


class UsuariosRepo(Protocol):
    def por_id(self, id_: int) -> dict | None: ...
    def por_email(self, email: str) -> dict | None: ...
    def criar(self, dados: dict) -> int: ...
    def atualizar(self, id_: int, dados: dict) -> None: ...
    def desativar(self, id_: int) -> None: ...


class CredenciaisInvalidas(Exception):
    pass


class UsuarioDesativado(Exception):
    pass


_HASH_FALSO = hash_senha("iguala-o-tempo-de-resposta-de-email-inexistente")


def autenticar(repo: UsuariosRepo, email: str, senha: str) -> dict:
    usuario = repo.por_email(email)
    if usuario is None:
        verificar_senha(senha, _HASH_FALSO)
        raise CredenciaisInvalidas
    if not verificar_senha(senha, usuario["senha_hash"]):
        raise CredenciaisInvalidas
    if not usuario["ativo"]:
        raise UsuarioDesativado
    return usuario


def cadastrar(repo: UsuariosRepo, nome: str, email: str, senha: str) -> dict:
    dados = {"nome": nome, "email": email, "senha": senha, "cargo_id": None, "telefone": None}
    return criar(repo, dados)


def criar(repo: UsuariosRepo, dados: dict) -> dict:
    return repo.por_id(repo.criar(_com_hash(dados)))


def atualizar(repo: UsuariosRepo, id_: int, dados: dict) -> dict | None:
    if repo.por_id(id_) is None:
        return None
    repo.atualizar(id_, _com_hash(dados))
    return repo.por_id(id_)


def desativar(repo: UsuariosRepo, id_: int) -> bool:
    if repo.por_id(id_) is None:
        return False
    repo.desativar(id_)
    return True


def _com_hash(dados: dict) -> dict:
    senha = dados["senha"]
    sem_senha = {k: v for k, v in dados.items() if k != "senha"}
    return {**sem_senha, "senha_hash": hash_senha(senha) if senha else None}
