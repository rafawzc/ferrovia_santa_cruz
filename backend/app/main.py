from fastapi import FastAPI
from fastapi.responses import JSONResponse
from mysql.connector import errorcode
from mysql.connector.errors import IntegrityError

from app.routers import alertas, auth, cargas, dashboard, linhas, usuarios

app = FastAPI(title="Ferrovia Santa Cruz")
for modulo in (auth, usuarios, linhas, cargas, alertas, dashboard):
    app.include_router(modulo.router)

CONFLITOS = {
    errorcode.ER_DUP_ENTRY: "Registro duplicado",
    errorcode.ER_NO_REFERENCED_ROW_2: "Referência inexistente",
}


@app.exception_handler(IntegrityError)
def conflito(request, erro: IntegrityError):
    detalhe = CONFLITOS.get(erro.errno, "Conflito de integridade")
    return JSONResponse({"detail": detalhe}, status_code=409)


@app.get("/api/health")
def health():
    return {"status": "ok"}
