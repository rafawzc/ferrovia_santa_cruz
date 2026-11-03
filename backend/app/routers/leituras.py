import os
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, Header, HTTPException, Query
from pydantic import BaseModel

from app.core.auth import exige_papel
from app.deps import Leituras

router = APIRouter(prefix="/api/leituras", tags=["leituras"])


def exige_chave_de_sensor(x_api_key: Annotated[str | None, Header()] = None) -> None:
    if x_api_key != os.environ["SENSOR_API_KEY"]:
        raise HTTPException(401, "Chave de sensor invalida")


class LeituraNova(BaseModel):
    sensor_id: int
    valor: float


class LeituraCriada(BaseModel):
    id: int
    sensor_id: int
    valor: float
    status_operacional: str
    data_hora: datetime
    alerta_id: int | None


class LeituraSaida(BaseModel):
    id: int
    sensor_id: int
    sensor_codigo: str
    trem_prefixo: str
    valor: float
    status_operacional: str
    data_hora: datetime


class SensorSaida(BaseModel):
    id: int
    tipo_dado: str


@router.post(
    "",
    response_model=LeituraCriada,
    status_code=201,
    dependencies=[Depends(exige_chave_de_sensor)],
)
def criar(corpo: LeituraNova, servico: Leituras):
    return servico.criar(corpo.model_dump())


@router.get(
    "/sensores",
    response_model=list[SensorSaida],
    dependencies=[Depends(exige_chave_de_sensor)],
)
def sensores(servico: Leituras):
    return servico.sensores()


@router.get(
    "",
    response_model=list[LeituraSaida],
    dependencies=[Depends(exige_papel("operacional", "gestao"))],
)
def listar(
    servico: Leituras,
    sensor_id: int | None = None,
    limite: Annotated[int, Query(ge=1, le=500)] = 50,
):
    return servico.listar(sensor_id, limite)
