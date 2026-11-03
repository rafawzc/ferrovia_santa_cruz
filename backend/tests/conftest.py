import os

import pytest
from fastapi.testclient import TestClient

from app import deps
from app.core.security import criar_token
from app.main import app
from tests.fakes import (
    CHAVE_SENSOR,
    AlertasFake,
    CargasFake,
    DashboardFake,
    LeiturasFake,
    LinhasFake,
    UsuariosFake,
)

os.environ["SENSOR_API_KEY"] = CHAVE_SENSOR


@pytest.fixture
def usuarios():
    return UsuariosFake()


@pytest.fixture
def client(usuarios):
    app.dependency_overrides[deps.usuarios_repo] = lambda: usuarios
    app.dependency_overrides[deps.linhas_repo] = LinhasFake
    app.dependency_overrides[deps.dashboard_repo] = DashboardFake
    cargas, alertas = CargasFake(), AlertasFake()
    app.dependency_overrides[deps.cargas_repo] = lambda: cargas
    app.dependency_overrides[deps.alertas_repo] = lambda: alertas
    leituras_fake = LeiturasFake()
    app.dependency_overrides[deps.leituras_repo] = lambda: leituras_fake
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def como(client):
    def entrar(usuario_id):
        client.cookies.set("sessao", criar_token(usuario_id, "ignorado"))
        return client

    return entrar


@pytest.fixture
def leituras(client):
    return app.dependency_overrides[deps.leituras_repo]()
