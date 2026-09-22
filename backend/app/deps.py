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


def _usuarios(repo: Annotated[UsuariosRepo, Depends(usuarios_repo)]) -> UsuariosService:
    return UsuariosService(repo)


def _linhas(repo: Annotated[LinhasRepo, Depends(linhas_repo)]) -> LinhasService:
    return LinhasService(repo)


def _cargas(repo: Annotated[CargasRepo, Depends(cargas_repo)]) -> CargasService:
    return CargasService(repo)


def _alertas(repo: Annotated[AlertasRepo, Depends(alertas_repo)]) -> AlertasService:
    return AlertasService(repo)


def _dashboard(repo: Annotated[DashboardRepo, Depends(dashboard_repo)]) -> DashboardService:
    return DashboardService(repo)


Usuarios = Annotated[UsuariosService, Depends(_usuarios)]
Linhas = Annotated[LinhasService, Depends(_linhas)]
Cargas = Annotated[CargasService, Depends(_cargas)]
Alertas = Annotated[AlertasService, Depends(_alertas)]
Dashboard = Annotated[DashboardService, Depends(_dashboard)]
