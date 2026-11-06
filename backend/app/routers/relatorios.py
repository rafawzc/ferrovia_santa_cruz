import csv
import io
from datetime import date
from typing import Literal

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel

from app.core.auth import exige_papel
from app.deps import Relatorios

router = APIRouter(
    prefix="/api/relatorios",
    tags=["relatorios"],
    dependencies=[Depends(exige_papel("gestao"))],
)

TipoRelatorio = Literal["desempenho", "consumo", "eficiencia", "manutencao"]
BOM = "\ufeff"


class Coluna(BaseModel):
    chave: str
    rotulo: str


class ItemDoGrafico(BaseModel):
    rotulo: str
    valor: int | float


class Grafico(BaseModel):
    rotulo: str
    itens: list[ItemDoGrafico]


class RelatorioSaida(BaseModel):
    tipo: TipoRelatorio
    inicio: date
    fim: date
    trem_id: int | None
    colunas: list[Coluna]
    linhas: list[dict]
    grafico: Grafico


@router.get("", response_model=RelatorioSaida)
def gerar(
    servico: Relatorios,
    tipo: TipoRelatorio,
    inicio: date,
    fim: date,
    trem_id: int | None = None,
):
    return servico.gerar(tipo, inicio, fim, trem_id)


@router.get("/csv")
def exportar_csv(
    servico: Relatorios,
    tipo: TipoRelatorio,
    inicio: date,
    fim: date,
    trem_id: int | None = None,
):
    relatorio = servico.gerar(tipo, inicio, fim, trem_id)
    chaves = [coluna["chave"] for coluna in relatorio["colunas"]]
    planilha = io.StringIO()
    escritor = csv.writer(planilha)
    escritor.writerow([coluna["rotulo"] for coluna in relatorio["colunas"]])
    escritor.writerows([linha[chave] for chave in chaves] for linha in relatorio["linhas"])
    return Response(
        BOM + planilha.getvalue(),
        media_type="text/csv; charset=utf-8",
        headers={
            "Content-Disposition": f"attachment; filename=relatorio-{tipo}-{inicio}-{fim}.csv"
        },
    )
