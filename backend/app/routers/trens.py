from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.auth import exige_papel
from app.deps import Trens

router = APIRouter(
    prefix="/api/trens",
    tags=["trens"],
    dependencies=[Depends(exige_papel("operacional", "gestao"))],
)
SO_GESTAO = [Depends(exige_papel("gestao"))]

StatusTrem = Literal["ativo", "manutencao", "parado"]


class TremNovo(BaseModel):
    prefixo: str = Field(min_length=1, max_length=20)
    modelo: str = Field(min_length=1, max_length=80)
    ano: int = Field(ge=1900, le=2100)
    capacidade_t: float = Field(gt=0)
    status: StatusTrem = "ativo"
    ultima_inspecao: date | None = None
    linha_id: int | None = None


class TremEdicao(BaseModel):
    prefixo: str | None = Field(default=None, min_length=1, max_length=20)
    modelo: str | None = Field(default=None, min_length=1, max_length=80)
    ano: int | None = Field(default=None, ge=1900, le=2100)
    capacidade_t: float | None = Field(default=None, gt=0)
    status: StatusTrem | None = None
    ultima_inspecao: date | None = None
    linha_id: int | None = None


class TremSaida(TremNovo):
    id: int
    linha_numero: str | None
    total_sensores: int


def _ou_404(trem):
    if trem is None:
        raise HTTPException(404, "Trem não encontrado")
    return trem


@router.get("", response_model=list[TremSaida])
def listar(servico: Trens, busca: str | None = None, status: StatusTrem | None = None):
    return servico.listar(busca, status)


@router.get("/{trem_id}", response_model=TremSaida)
def detalhe(trem_id: int, servico: Trens):
    return _ou_404(servico.por_id(trem_id))


@router.post("", response_model=TremSaida, status_code=201, dependencies=SO_GESTAO)
def criar(corpo: TremNovo, servico: Trens):
    return servico.criar(corpo.model_dump())


@router.patch("/{trem_id}", response_model=TremSaida, dependencies=SO_GESTAO)
def editar(trem_id: int, corpo: TremEdicao, servico: Trens):
    return _ou_404(servico.atualizar(trem_id, corpo.model_dump()))


@router.delete("/{trem_id}", status_code=204, dependencies=SO_GESTAO)
def excluir(trem_id: int, servico: Trens):
    if not servico.excluir(trem_id):
        raise HTTPException(404, "Trem não encontrado")
