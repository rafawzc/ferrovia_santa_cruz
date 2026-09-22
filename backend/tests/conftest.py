import pytest
from fastapi.testclient import TestClient

from app.core.security import criar_token
from app.main import app
from app.repositories.usuarios import UsuariosMySQL
from tests.fakes import UsuariosFake


@pytest.fixture
def usuarios():
    return UsuariosFake()


@pytest.fixture
def client(usuarios):
    app.dependency_overrides[UsuariosMySQL] = lambda: usuarios
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def como(client):
    def entrar(usuario_id):
        client.cookies.set("sessao", criar_token(usuario_id, "ignorado"))
        return client

    return entrar
