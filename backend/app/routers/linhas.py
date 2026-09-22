from typing import Annotated, Literal

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from app.core.auth import exige_papel
from app.repositories.linhas import LinhasMySQL

router = APIRouter(
    prefix="/api/linhas",
    tags=["linhas"],
    dependencies=[Depends(exige_papel("operacional", "gestao"))],
)


class LinhaSaida(BaseModel):
    id: int
    numero: str
    status: Literal["manutencao", "atraso", "fechado", "na_estacao", "ja_partiu"]
    ativo: bool


@router.get("", response_model=list[LinhaSaida])
def listar(repo: Annotated[LinhasMySQL, Depends()]):
    return repo.listar()
