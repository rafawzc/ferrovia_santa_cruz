from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.auth import exige_papel
from app.deps import Alertas

router = APIRouter(
    prefix="/api/alertas",
    tags=["alertas"],
    dependencies=[Depends(exige_papel("operacional", "gestao"))],
)

Severidade = Literal["normal", "atencao", "critico"]


class AlertaNovo(BaseModel):
    linha_id: int
    tipo: str = Field(min_length=1, max_length=40)
    severidade: Severidade = "normal"
    tempo_espera: str | None = Field(default=None, max_length=40)
    motivo: str = Field(min_length=1, max_length=200)
    status: str = Field(min_length=1, max_length=40)


class AlertaTratamento(BaseModel):
    tratado: bool


class AlertaSaida(BaseModel):
    id: int
    linha_id: int | None
    linha_numero: str | None
    leitura_id: int | None
    tipo: str
    severidade: Severidade
    tempo_espera: str | None
    motivo: str
    status: str
    tratado: bool
    criado_em: datetime


@router.get("", response_model=list[AlertaSaida])
def listar(
    servico: Alertas,
    severidade: Severidade | None = None,
    tipo: str | None = None,
    tratado: bool | None = None,
):
    return servico.listar({"severidade": severidade, "tipo": tipo, "tratado": tratado})


@router.post("", response_model=AlertaSaida, status_code=201)
def criar(corpo: AlertaNovo, servico: Alertas):
    return servico.criar(corpo.model_dump())


@router.patch("/{alerta_id}", response_model=AlertaSaida)
def tratar(alerta_id: int, corpo: AlertaTratamento, servico: Alertas):
    alerta = servico.marcar_tratado(alerta_id, corpo.tratado)
    if alerta is None:
        raise HTTPException(404, "Alerta não encontrado")
    return alerta
