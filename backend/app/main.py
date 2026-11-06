from fastapi import FastAPI
from fastapi.responses import JSONResponse
from mysql.connector import errorcode
from mysql.connector.errors import IntegrityError

from app.db import BancoIndisponivel
from app.routers import (
    alertas,
    auth,
    cargas,
    dashboard,
    leituras,
    linhas,
    relatorios,
    sensores,
    trens,
    usuarios,
    viagens,
)

app = FastAPI(title="Ferrovia Santa Cruz")
MODULOS = (
    auth,
    usuarios,
    linhas,
    cargas,
    alertas,
    dashboard,
    trens,
    sensores,
    viagens,
    relatorios,
    leituras,
)
for modulo in MODULOS:
    app.include_router(modulo.router)

CONFLITOS = {
    errorcode.ER_DUP_ENTRY: "Registro duplicado",
    errorcode.ER_NO_REFERENCED_ROW_2: "Referência inexistente",
    errorcode.ER_ROW_IS_REFERENCED_2: "Registro em uso por outro cadastro",
}


@app.exception_handler(IntegrityError)
def tratar_conflito(request, erro: IntegrityError):
    detalhe = CONFLITOS.get(erro.errno, "Conflito de integridade")
    return JSONResponse({"detail": detalhe}, status_code=409)


@app.exception_handler(BancoIndisponivel)
def tratar_banco_indisponivel(request, erro: BancoIndisponivel):
    return JSONResponse({"detail": "Banco de dados indisponível"}, status_code=503)


@app.get("/api/health")
def health():
    return {"status": "ok"}
