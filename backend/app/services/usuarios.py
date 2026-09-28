from typing import Protocol

from app.core.security import hash_senha, verificar_senha


class UsuariosRepo(Protocol):
    def por_id(self, usuario_id: int) -> dict | None: ...
    def por_email(self, email: str) -> dict | None: ...
    def listar(self) -> list[dict]: ...
    def listar_cargos(self) -> list[dict]: ...
    def criar(self, usuario: dict) -> int: ...
    def atualizar(self, usuario_id: int, usuario: dict) -> None: ...
    def desativar(self, usuario_id: int) -> None: ...


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

    def por_id(self, usuario_id: int) -> dict | None:
        return self.repo.por_id(usuario_id)

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
        return self.criar(
            {"nome": nome, "email": email, "senha": senha, "cargo_id": None, "telefone": None}
        )

    def criar(self, usuario: dict) -> dict:
        return self.repo.por_id(self.repo.criar(_trocar_senha_por_hash(usuario)))

    def atualizar(self, usuario_id: int, usuario: dict) -> dict | None:
        if self.repo.por_id(usuario_id) is None:
            return None
        self.repo.atualizar(usuario_id, _trocar_senha_por_hash(usuario))
        return self.repo.por_id(usuario_id)

    def atualizar_perfil(self, usuario: dict, dados: dict, senha_atual: str | None) -> dict:
        if dados["senha"] and not verificar_senha(senha_atual or "", usuario["senha_hash"]):
            raise SenhaAtualIncorreta
        sem_privilegios = {"cargo_id": None, "ativo": None}
        return self.atualizar(usuario["id"], {**dados, **sem_privilegios})

    def desativar(self, usuario_id: int) -> bool:
        if self.repo.por_id(usuario_id) is None:
            return False
        self.repo.desativar(usuario_id)
        return True


def _trocar_senha_por_hash(usuario: dict) -> dict:
    senha = usuario["senha"]
    sem_senha = {k: v for k, v in usuario.items() if k != "senha"}
    return {**sem_senha, "senha_hash": hash_senha(senha) if senha else None}
