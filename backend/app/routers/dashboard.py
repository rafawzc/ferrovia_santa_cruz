from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.auth import exige_papel
from app.repositories.dashboard import DashboardMySQL

router = APIRouter(
    prefix="/api/dashboard",
    tags=["dashboard"],
    dependencies=[Depends(exige_papel("operacional", "gestao"))],
)


class Metricas(BaseModel):
    linhas_ativas: int
    linhas_em_manutencao: int
    sensores: int
    velocidade_media: float | None


@router.get("", response_model=Metricas)
def metricas(repo: Annotated[DashboardMySQL, Depends()]):
    return repo.metricas()
