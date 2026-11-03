from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.auth import exige_papel, usuario_atual
from app.deps import Dashboard

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(exige_papel("cliente", "operacional", "gestao"))],
)


class TrensPorStatus(BaseModel):
    status: str
    quantidade: int


class AlertasPorSeveridade(BaseModel):
    severidade: str
    quantidade: int


class Indicadores(BaseModel):
    trens_por_status: list[TrensPorStatus] | None
    alertas_ativos_por_severidade: list[AlertasPorSeveridade] | None
    sensores_criticos: int | None
    viagens_em_andamento: int
    velocidade_media: float | None


@router.get("", response_model=Indicadores)
def indicadores(servico: Dashboard, usuario: Annotated[dict, Depends(usuario_atual)]):
    return servico.indicadores(usuario)
