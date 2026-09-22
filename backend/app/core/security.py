import os
from datetime import UTC, datetime, timedelta

import jwt
from pwdlib import PasswordHash

SESSAO = timedelta(hours=8)

_hasher = PasswordHash.recommended()


def hash_senha(senha: str) -> str:
    return _hasher.hash(senha)


def verificar_senha(senha: str, hash_: str) -> bool:
    return _hasher.verify(senha, hash_)


def criar_token(usuario_id: int, papel: str, validade: timedelta = SESSAO) -> str:
    payload = {"sub": str(usuario_id), "papel": papel, "exp": datetime.now(UTC) + validade}
    return jwt.encode(payload, os.environ["JWT_SECRET"], algorithm="HS256")


def ler_token(token: str) -> int | None:
    try:
        payload = jwt.decode(token, os.environ["JWT_SECRET"], algorithms=["HS256"])
    except jwt.InvalidTokenError:
        return None
    return int(payload["sub"])
