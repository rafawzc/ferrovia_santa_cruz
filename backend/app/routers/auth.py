from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field

from app.core.auth import COOKIE, usuario_atual
from app.core.security import SESSAO, criar_token
from app.repositories.usuarios import UsuariosMySQL
from app.services import usuarios
from app.services.usuarios import CredenciaisInvalidas, UsuarioDesativado

router = APIRouter(prefix="/api/auth", tags=["auth"])

Email = Annotated[str, Field(max_length=160, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")]
Senha = Annotated[str, Field(min_length=8, max_length=128)]
Nome = Annotated[str, Field(min_length=1, max_length=120)]
Repo = Annotated[UsuariosMySQL, Depends()]


class UsuarioSaida(BaseModel):
    id: int
    nome: str
    email: str
    telefone: str | None
    foto_url: str | None
    cargo: str
    papel: str
    ativo: bool


class Login(BaseModel):
    email: str
    senha: str


class Cadastro(BaseModel):
    nome: Nome
    email: Email
    senha: Senha


class RecuperarSenha(BaseModel):
    email: str


@router.post("/login", response_model=UsuarioSaida)
def login(corpo: Login, response: Response, repo: Repo):
    try:
        usuario = usuarios.autenticar(repo, corpo.email, corpo.senha)
    except CredenciaisInvalidas:
        raise HTTPException(401, "Credenciais inválidas") from None
    except UsuarioDesativado:
        raise HTTPException(403, "Usuário desativado") from None
    response.set_cookie(
        COOKIE,
        criar_token(usuario["id"], usuario["papel"]),
        max_age=int(SESSAO.total_seconds()),
        httponly=True,
        samesite="lax",
        secure=False,
    )
    return usuario


@router.post("/logout", status_code=204)
def logout(response: Response):
    response.delete_cookie(COOKIE)


@router.get("/me", response_model=UsuarioSaida)
def me(usuario: Annotated[dict, Depends(usuario_atual)]):
    return usuario


@router.post("/cadastro", response_model=UsuarioSaida, status_code=201)
def cadastro(corpo: Cadastro, repo: Repo):
    return usuarios.cadastrar(repo, corpo.nome, corpo.email, corpo.senha)


@router.post("/recuperar-senha", status_code=202)
def recuperar_senha(corpo: RecuperarSenha):
    return {"detail": "Se o e-mail estiver cadastrado, as instruções serão enviadas"}
