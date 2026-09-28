from typing import Annotated

from fastapi import Depends

from app.repositories.alertas import AlertasMySQL
from app.repositories.cargas import CargasMySQL
from app.repositories.dashboard import DashboardMySQL
from app.repositories.linhas import LinhasMySQL
from app.repositories.usuarios import UsuariosMySQL
from app.services.alertas import AlertasRepo, AlertasService
from app.services.cargas import CargasRepo, CargasService
from app.services.dashboard import DashboardRepo, DashboardService
from app.services.linhas import LinhasRepo, LinhasService
from app.services.usuarios import UsuariosRepo, UsuariosService


def usuarios_repo() -> UsuariosRepo:
    return UsuariosMySQL()


def linhas_repo() -> LinhasRepo:
    return LinhasMySQL()


def cargas_repo() -> CargasRepo:
    return CargasMySQL()


def alertas_repo() -> AlertasRepo:
    return AlertasMySQL()


def dashboard_repo() -> DashboardRepo:
    return DashboardMySQL()


def _usuarios_servico(repo: Annotated[UsuariosRepo, Depends(usuarios_repo)]) -> UsuariosService:
    return UsuariosService(repo)


def _linhas_servico(repo: Annotated[LinhasRepo, Depends(linhas_repo)]) -> LinhasService:
    return LinhasService(repo)


def _cargas_servico(repo: Annotated[CargasRepo, Depends(cargas_repo)]) -> CargasService:
    return CargasService(repo)


def _alertas_servico(repo: Annotated[AlertasRepo, Depends(alertas_repo)]) -> AlertasService:
    return AlertasService(repo)


def _dashboard_servico(repo: Annotated[DashboardRepo, Depends(dashboard_repo)]) -> DashboardService:
    return DashboardService(repo)


Usuarios = Annotated[UsuariosService, Depends(_usuarios_servico)]
Linhas = Annotated[LinhasService, Depends(_linhas_servico)]
Cargas = Annotated[CargasService, Depends(_cargas_servico)]
Alertas = Annotated[AlertasService, Depends(_alertas_servico)]
Dashboard = Annotated[DashboardService, Depends(_dashboard_servico)]
