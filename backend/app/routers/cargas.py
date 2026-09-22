from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.core.auth import exige_papel
from app.repositories.cargas import CargasMySQL

router = APIRouter(
    prefix="/api/cargas",
    tags=["cargas"],
    dependencies=[Depends(exige_papel("operacional", "gestao"))],
)

Repo = Annotated[CargasMySQL, Depends()]


class CargaNova(BaseModel):
    tipo: str = Field(min_length=1, max_length=80)
    peso_t: float = Field(gt=0, lt=10000)
    local_partida: str = Field(min_length=1, max_length=120)
    destino: str = Field(min_length=1, max_length=120)
    vagao: str | None = Field(default=None, max_length=20)
    trem_id: int | None = None


class CargaSaida(CargaNova):
    id: int
    criado_em: datetime


@router.get("", response_model=list[CargaSaida])
def listar(repo: Repo):
    return repo.listar()


@router.post("", response_model=CargaSaida, status_code=201)
def criar(corpo: CargaNova, repo: Repo):
    return repo.criar(corpo.model_dump())
