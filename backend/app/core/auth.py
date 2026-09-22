from typing import Annotated

from fastapi import Cookie, Depends, HTTPException

from app.core.security import ler_token
from app.deps import Usuarios

COOKIE = "sessao"


def usuario_atual(
    servico: Usuarios,
    sessao: Annotated[str | None, Cookie()] = None,
) -> dict:
    usuario_id = ler_token(sessao) if sessao else None
    usuario = servico.por_id(usuario_id) if usuario_id else None
    if usuario is None or not usuario["ativo"]:
        raise HTTPException(401, "Não autenticado")
    return usuario


def exige_papel(*papeis: str):
    def guarda(usuario: Annotated[dict, Depends(usuario_atual)]) -> dict:
        if usuario["papel"] not in papeis:
            raise HTTPException(403, "Sem permissão")
        return usuario

    return guarda
