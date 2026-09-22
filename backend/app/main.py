from fastapi import FastAPI
from fastapi.responses import JSONResponse
from mysql.connector import errorcode
from mysql.connector.errors import IntegrityError

from app.routers import alertas, auth, cargas, linhas, usuarios

app = FastAPI(title="Ferrovia Santa Cruz")
app.include_router(auth.router)
app.include_router(usuarios.router)
app.include_router(linhas.router)
app.include_router(cargas.router)
app.include_router(alertas.router)

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
