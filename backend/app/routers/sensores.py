from datetime import datetime
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.core.auth import exige_papel
from app.deps import Sensores

router = APIRouter(
    prefix="/api/sensores",
    tags=["sensores"],
    dependencies=[Depends(exige_papel("operacional", "gestao"))],
)
SO_GESTAO = [Depends(exige_papel("gestao"))]

TipoDado = Literal["velocidade", "temperatura", "falha", "energia", "localizacao"]
StatusLeitura = Literal["normal", "alerta", "falha"]


class SensorNovo(BaseModel):
    codigo: str = Field(min_length=1, max_length=20)
    nome: str = Field(min_length=1, max_length=80)
    tipo_dado: TipoDado
    localizacao: str = Field(min_length=1, max_length=120)
    segmento: str | None = Field(default=None, max_length=80)
    trem_id: int


class SensorEdicao(BaseModel):
    codigo: str | None = Field(default=None, min_length=1, max_length=20)
    nome: str | None = Field(default=None, min_length=1, max_length=80)
    tipo_dado: TipoDado | None = None
    localizacao: str | None = Field(default=None, min_length=1, max_length=120)
    segmento: str | None = Field(default=None, max_length=80)
    trem_id: int | None = None


class SensorSaida(SensorNovo):
    id: int
    trem_prefixo: str
    trem_modelo: str
    ultima_leitura_status: StatusLeitura | None
    ultima_leitura_valor: float | None
    ultima_leitura_data: datetime | None


def _ou_404(sensor):
    if sensor is None:
        raise HTTPException(404, "Sensor não encontrado")
    return sensor


@router.get("", response_model=list[SensorSaida])
def listar(servico: Sensores, tipo: TipoDado | None = None, trem_id: int | None = None):
    return servico.listar(tipo, trem_id)


@router.get("/{sensor_id}", response_model=SensorSaida)
def detalhe(sensor_id: int, servico: Sensores):
    return _ou_404(servico.por_id(sensor_id))


@router.post("", response_model=SensorSaida, status_code=201, dependencies=SO_GESTAO)
def criar(corpo: SensorNovo, servico: Sensores):
    return servico.criar(corpo.model_dump())


@router.patch("/{sensor_id}", response_model=SensorSaida, dependencies=SO_GESTAO)
def editar(sensor_id: int, corpo: SensorEdicao, servico: Sensores):
    return _ou_404(servico.atualizar(sensor_id, corpo.model_dump()))


@router.delete("/{sensor_id}", status_code=204, dependencies=SO_GESTAO)
def excluir(sensor_id: int, servico: Sensores):
    if not servico.excluir(sensor_id):
        raise HTTPException(404, "Sensor não encontrado")
