import pytest
from fastapi.testclient import TestClient

from app import deps
from app.core.security import criar_token
from app.main import app
from tests.fakes import (
    AlertasFake,
    CargasFake,
    DashboardFake,
    LinhasFake,
    RelatoriosFake,
    SensoresFake,
    TrensFake,
    UsuariosFake,
    ViagensFake,
)


@pytest.fixture
def usuarios():
    return UsuariosFake()


@pytest.fixture
def client(usuarios):
    app.dependency_overrides[deps.usuarios_repo] = lambda: usuarios
    app.dependency_overrides[deps.dashboard_repo] = DashboardFake
    cargas, alertas = CargasFake(), AlertasFake()
    trens, sensores = TrensFake(), SensoresFake()
    app.dependency_overrides[deps.cargas_repo] = lambda: cargas
    app.dependency_overrides[deps.alertas_repo] = lambda: alertas
    linhas, viagens = LinhasFake(), ViagensFake()
    app.dependency_overrides[deps.trens_repo] = lambda: trens
    app.dependency_overrides[deps.sensores_repo] = lambda: sensores
    app.dependency_overrides[deps.linhas_repo] = lambda: linhas
    app.dependency_overrides[deps.viagens_repo] = lambda: viagens
    relatorios = RelatoriosFake()
    app.dependency_overrides[deps.relatorios_repo] = lambda: relatorios
    yield TestClient(app)
    app.dependency_overrides.clear()


@pytest.fixture
def como(client):
    def entrar(usuario_id):
        client.cookies.set("sessao", criar_token(usuario_id, "ignorado"))
        return client

    return entrar
