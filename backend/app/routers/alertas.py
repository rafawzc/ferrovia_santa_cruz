from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.auth import exige_papel
from app.repositories.alertas import AlertasMySQL

router = APIRouter(
    prefix="/api/alertas",
    tags=["alertas"],
    dependencies=[Depends(exige_papel("operacional", "gestao"))],
)

Repo = Annotated[AlertasMySQL, Depends()]


class AlertaNovo(BaseModel):
    linha_id: int
    tempo_espera: str | None = Field(default=None, max_length=40)
    motivo: str = Field(min_length=1, max_length=200)
    status: str = Field(min_length=1, max_length=40)


class AlertaSaida(AlertaNovo):
    id: int
    linha_numero: str
    criado_em: datetime


@router.get("", response_model=list[AlertaSaida])
def listar(repo: Repo):
    return repo.listar()


@router.post("", response_model=AlertaSaida, status_code=201)
def criar(corpo: AlertaNovo, repo: Repo):
    return repo.criar(corpo.model_dump())
