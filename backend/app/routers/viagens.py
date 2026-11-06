from datetime import date, datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.core.auth import exige_papel
from app.deps import Viagens

router = APIRouter(
    prefix="/api/viagens",
    tags=["viagens"],
    dependencies=[Depends(exige_papel("cliente", "operacional", "gestao"))],
)

StatusViagem = Literal["programada", "em_andamento", "concluida", "cancelada", "atrasada"]


class ViagemNova(BaseModel):
    linha_id: int
    trem_id: int
    partida_prevista: datetime
    chegada_prevista: datetime
    status: StatusViagem = "programada"


class ViagemEdicao(BaseModel):
    linha_id: int | None = None
    trem_id: int | None = None
    partida_prevista: datetime | None = None
    chegada_prevista: datetime | None = None
    status: StatusViagem | None = None


class ViagemSaida(ViagemNova):
    id: int
    linha_numero: str
    origem: str
    destino: str
    trem_prefixo: str
    criado_em: datetime


def _ou_404(viagem):
    if viagem is None:
        raise HTTPException(404, "Viagem não encontrada")
    return viagem


@router.get("", response_model=list[ViagemSaida])
def listar(
    servico: Viagens,
    status: StatusViagem | None = None,
    trem_id: int | None = None,
    linha_id: int | None = None,
    data: date | None = None,
):
    return servico.listar(
        {"status": status, "trem_id": trem_id, "linha_id": linha_id, "data": data}
    )


@router.get("/{viagem_id}", response_model=ViagemSaida)
def detalhe(viagem_id: int, servico: Viagens):
    return _ou_404(servico.por_id(viagem_id))


@router.post(
    "",
    response_model=ViagemSaida,
    status_code=201,
    dependencies=[Depends(exige_papel("gestao"))],
)
def criar(corpo: ViagemNova, servico: Viagens):
    return servico.criar(corpo.model_dump())


@router.patch(
    "/{viagem_id}",
    response_model=ViagemSaida,
    dependencies=[Depends(exige_papel("gestao"))],
)
def editar(viagem_id: int, corpo: ViagemEdicao, servico: Viagens):
    return _ou_404(servico.atualizar(viagem_id, corpo.model_dump()))


@router.delete("/{viagem_id}", status_code=204, dependencies=[Depends(exige_papel("gestao"))])
def remover(viagem_id: int, servico: Viagens):
    if not servico.remover(viagem_id):
        raise HTTPException(404, "Viagem não encontrada")
