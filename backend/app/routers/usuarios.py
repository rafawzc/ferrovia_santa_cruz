from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.auth import exige_papel
from app.deps import Usuarios
from app.routers.auth import Email, Nome, Senha, UsuarioSaida

router = APIRouter(prefix="/api", tags=["usuarios"], dependencies=[Depends(exige_papel("gestao"))])

Telefone = Annotated[str, Field(max_length=20)]


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
def editar(usuario_id: int, corpo: UsuarioEdicao, servico: Usuarios):
    return _ou_404(servico.atualizar(usuario_id, corpo.model_dump()))


@router.delete("/usuarios/{usuario_id}", status_code=204)
def desativar(usuario_id: int, servico: Usuarios):
    if not servico.desativar(usuario_id):
        raise HTTPException(404, "Usuário não encontrado")


@router.get("/cargos", response_model=list[CargoSaida])
def cargos(servico: Usuarios):
    return servico.listar_cargos()
