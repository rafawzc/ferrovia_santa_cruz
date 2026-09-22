import pytest
from fastapi.testclient import TestClient

from app.core.security import criar_token
from app.main import app
from app.repositories.alertas import AlertasMySQL
from app.repositories.cargas import CargasMySQL
from app.repositories.dashboard import DashboardMySQL
from app.repositories.linhas import LinhasMySQL
from app.repositories.usuarios import UsuariosMySQL
from tests.fakes import AlertasFake, CargasFake, DashboardFake, LinhasFake, UsuariosFake


@pytest.fixture
def usuarios():
    return UsuariosFake()


@pytest.fixture
def client(usuarios):
    app.dependency_overrides[UsuariosMySQL] = lambda: usuarios
    app.dependency_overrides[LinhasMySQL] = LinhasFake
    app.dependency_overrides[DashboardMySQL] = DashboardFake
    cargas, alertas = CargasFake(), AlertasFake()
    app.dependency_overrides[CargasMySQL] = lambda: cargas
    app.dependency_overrides[AlertasMySQL] = lambda: alertas
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def como(client):
    def entrar(usuario_id):
        client.cookies.set("sessao", criar_token(usuario_id, "ignorado"))
        return client

    return entrar
