from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import exige_papel, usuario_atual
from app.deps import Usuarios
from app.routers.auth import Email, Nome, Senha, Telefone, UsuarioSaida
from app.services.usuarios import AutoDesativacaoProibida, UltimoAdministradorAtivo

router = APIRouter(prefix="/api", tags=["usuarios"], dependencies=[Depends(exige_papel("gestao"))])


class UsuarioNovo(BaseModel):
    nome: Nome
    email: Email
    senha: Senha
    cargo_id: int
    telefone: Telefone | None = None


class UsuarioEdicao(BaseModel):
    nome: Nome | None = None
    email: Email | None = None
    senha: Senha | None = None
    cargo_id: int | None = None
    telefone: Telefone | None = None
    ativo: bool | None = None


class CargoSaida(BaseModel):
    id: int
    nome: str
    papel: str


class SenhaTemporariaSaida(BaseModel):
    senha_temporaria: str


Autor = Annotated[dict, Depends(usuario_atual)]


def _ou_404(usuario):
    if usuario is None:
        raise HTTPException(404, "Usuário não encontrado")
    return usuario


@router.get("/usuarios", response_model=list[UsuarioSaida])
def listar(servico: Usuarios):
    return servico.listar()


@router.get("/usuarios/{usuario_id}", response_model=UsuarioSaida)
def detalhe(usuario_id: int, servico: Usuarios):
    return _ou_404(servico.por_id(usuario_id))


@router.post("/usuarios", response_model=UsuarioSaida, status_code=201)
def criar(corpo: UsuarioNovo, servico: Usuarios):
    return servico.criar(corpo.model_dump())


@router.patch("/usuarios/{usuario_id}", response_model=UsuarioSaida)
def editar(usuario_id: int, corpo: UsuarioEdicao, servico: Usuarios, autor: Autor):
    try:
        return _ou_404(servico.atualizar(usuario_id, corpo.model_dump(), autor["id"]))
    except AutoDesativacaoProibida:
        raise HTTPException(403, "Você não pode desativar a própria conta") from None
    except UltimoAdministradorAtivo:
        raise HTTPException(409, "O sistema precisa de pelo menos um administrador ativo") from None


@router.delete("/usuarios/{usuario_id}", status_code=204)
def desativar(usuario_id: int, servico: Usuarios, autor: Autor):
    try:
        encontrado = servico.desativar(usuario_id, autor["id"])
    except AutoDesativacaoProibida:
        raise HTTPException(403, "Você não pode desativar a própria conta") from None
    except UltimoAdministradorAtivo:
        raise HTTPException(409, "O sistema precisa de pelo menos um administrador ativo") from None
    if not encontrado:
        raise HTTPException(404, "Usuário não encontrado")


@router.post("/usuarios/{usuario_id}/senha-temporaria", response_model=SenhaTemporariaSaida)
def senha_temporaria(usuario_id: int, servico: Usuarios):
    return {"senha_temporaria": _ou_404(servico.gerar_senha_temporaria(usuario_id))}


@router.get("/cargos", response_model=list[CargoSaida])
def cargos(servico: Usuarios):
    return servico.listar_cargos()
