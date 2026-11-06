import secrets
from typing import Protocol

from app.core.security import hash_senha, verificar_senha


class UsuariosRepo(Protocol):
    def por_id(self, usuario_id: int) -> dict | None: ...
    def por_email(self, email: str) -> dict | None: ...
    def listar(self, busca: str | None, papel: str | None, ativo: bool | None) -> list[dict]: ...
    def listar_cargos(self) -> list[dict]: ...
    def criar(self, usuario: dict) -> int: ...
    def atualizar(self, usuario_id: int, usuario: dict) -> None: ...
    def desativar(self, usuario_id: int) -> None: ...
    def trocar_senha(self, usuario_id: int, senha_hash: str) -> None: ...
    def contar_administradores_ativos(self) -> int: ...


class CredenciaisInvalidas(Exception):
    pass


class UsuarioDesativado(Exception):
    pass


class SenhaAtualIncorreta(Exception):
    pass


class AutoDesativacaoProibida(Exception):
    pass


class UltimoAdministradorAtivo(Exception):
    pass


_HASH_FALSO = hash_senha("iguala-o-tempo-de-resposta-de-email-inexistente")
_ALFABETO_TEMPORARIO = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789"
_TAMANHO_TEMPORARIO = 12


class UsuariosService:
    def __init__(self, repo: UsuariosRepo):
        self.repo = repo

    def por_id(self, usuario_id: int) -> dict | None:
        return self.repo.por_id(usuario_id)

    def listar(self, busca: str | None, papel: str | None, ativo: bool | None) -> list[dict]:
        return self.repo.listar(busca, papel, ativo)

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

    def atualizar(self, usuario_id: int, usuario: dict, autor_id: int) -> dict | None:
        alvo = self.repo.por_id(usuario_id)
        if alvo is None:
            return None
        if usuario["ativo"] is False:
            self._exigir_desativacao_permitida(alvo, autor_id)
        elif self._deixa_de_ser_administrador(alvo, usuario["cargo_id"]):
            self._exigir_outro_administrador()
        self.repo.atualizar(usuario_id, _trocar_senha_por_hash(usuario))
        return self.repo.por_id(usuario_id)

    def atualizar_perfil(self, usuario: dict, dados: dict, senha_atual: str | None) -> dict:
        if dados["senha"] and not verificar_senha(senha_atual or "", usuario["senha_hash"]):
            raise SenhaAtualIncorreta
        sem_privilegios = {"cargo_id": None, "ativo": None}
        return self.atualizar(usuario["id"], {**dados, **sem_privilegios}, usuario["id"])

    def desativar(self, usuario_id: int, autor_id: int) -> bool:
        alvo = self.repo.por_id(usuario_id)
        if alvo is None:
            return False
        self._exigir_desativacao_permitida(alvo, autor_id)
        self.repo.desativar(usuario_id)
        return True

    def gerar_senha_temporaria(self, usuario_id: int) -> str | None:
        if self.repo.por_id(usuario_id) is None:
            return None
        senha = "".join(secrets.choice(_ALFABETO_TEMPORARIO) for _ in range(_TAMANHO_TEMPORARIO))
        self.repo.trocar_senha(usuario_id, hash_senha(senha))
        return senha

    def _deixa_de_ser_administrador(self, alvo: dict, cargo_id: int | None) -> bool:
        if cargo_id is None or not alvo["ativo"] or alvo["papel"] != "gestao":
            return False
        papeis = {c["id"]: c["papel"] for c in self.repo.listar_cargos()}
        papel_novo = papeis.get(cargo_id, "gestao")
        return papel_novo != "gestao"

    def _exigir_outro_administrador(self) -> None:
        if self.repo.contar_administradores_ativos() <= 1:
            raise UltimoAdministradorAtivo

    def _exigir_desativacao_permitida(self, alvo: dict, autor_id: int) -> None:
        if alvo["papel"] == "gestao":
            self._exigir_outro_administrador()
        if alvo["id"] == autor_id:
            raise AutoDesativacaoProibida


def _trocar_senha_por_hash(usuario: dict) -> dict:
    senha = usuario["senha"]
    sem_senha = {k: v for k, v in usuario.items() if k != "senha"}
    return {**sem_senha, "senha_hash": hash_senha(senha) if senha else None}
