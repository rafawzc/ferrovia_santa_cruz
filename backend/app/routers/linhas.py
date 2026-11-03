from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.auth import exige_papel
from app.deps import Linhas

router = APIRouter(
    prefix="/api/linhas",
    tags=["linhas"],
    dependencies=[Depends(exige_papel("operacional", "gestao"))],
)

StatusLinha = Literal["manutencao", "atraso", "fechado", "na_estacao", "ja_partiu"]


class LinhaNova(BaseModel):
    numero: str = Field(min_length=1, max_length=20)
    origem: str = Field(min_length=1, max_length=120)
    destino: str = Field(min_length=1, max_length=120)
    status: StatusLinha
    ativo: bool = True


class LinhaEdicao(BaseModel):
    numero: str | None = Field(default=None, min_length=1, max_length=20)
    origem: str | None = Field(default=None, min_length=1, max_length=120)
    destino: str | None = Field(default=None, min_length=1, max_length=120)
    status: StatusLinha | None = None
    ativo: bool | None = None


class LinhaSaida(LinhaNova):
    id: int


def _ou_404(linha):
    if linha is None:
        raise HTTPException(404, "Linha não encontrada")
    return linha


@router.get("", response_model=list[LinhaSaida])
def listar(servico: Linhas, status: StatusLinha | None = None):
    return servico.listar({"status": status})


@router.post(
    "",
    response_model=LinhaSaida,
    status_code=201,
    dependencies=[Depends(exige_papel("gestao"))],
)
def criar(corpo: LinhaNova, servico: Linhas):
    return servico.criar(corpo.model_dump())


@router.patch(
    "/{linha_id}",
    response_model=LinhaSaida,
    dependencies=[Depends(exige_papel("gestao"))],
)
def editar(linha_id: int, corpo: LinhaEdicao, servico: Linhas):
    return _ou_404(servico.atualizar(linha_id, corpo.model_dump()))


@router.delete("/{linha_id}", status_code=204, dependencies=[Depends(exige_papel("gestao"))])
def remover(linha_id: int, servico: Linhas):
    if not servico.remover(linha_id):
        raise HTTPException(404, "Linha não encontrada")
