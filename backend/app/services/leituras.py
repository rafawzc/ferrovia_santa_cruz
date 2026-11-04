from typing import Protocol

LIMITES = {
    "velocidade": (90.0, 110.0),
    "temperatura": (95.0, 110.0),
    "energia": (400.0, 500.0),
    "falha": (0.5, 0.9),
}
GRANDEZAS = {
    "velocidade": "Velocidade do trem",
    "temperatura": "Temperatura do motor",
    "energia": "Consumo de energia",
    "falha": "Indice de falha",
}
NIVEIS = {
    "critico": ("falha", "Critico", "acima do limite critico"),
    "atencao": ("alerta", "Atencao", "acima do limite de atencao"),
}


def _nivel(tipo_dado: str | None, valor: float) -> str | None:
    atencao, critico = LIMITES.get(tipo_dado, (None, None))
    if critico is None:
        return None
    if valor > critico:
        return "critico"
    if valor > atencao:
        return "atencao"
    return None


class LeiturasRepo(Protocol):
    def tipo_do_sensor(self, sensor_id: int) -> str | None: ...
    def sensores(self) -> list[dict]: ...
    def criar(self, leitura: dict, alerta: dict | None) -> dict: ...
    def listar(self, sensor_id: int | None, limite: int) -> list[dict]: ...


class LeiturasService:
    def __init__(self, repo: LeiturasRepo):
        self.repo = repo

    def sensores(self) -> list[dict]:
        return self.repo.sensores()

    def listar(self, sensor_id: int | None, limite: int) -> list[dict]:
        return self.repo.listar(sensor_id, limite)

    def criar(self, leitura: dict) -> dict:
        tipo_dado = self.repo.tipo_do_sensor(leitura["sensor_id"])
        nivel = _nivel(tipo_dado, leitura["valor"])
        if nivel is None:
            return self.repo.criar({**leitura, "status_operacional": "normal"}, None)
        status_operacional, rotulo_do_status, descricao = NIVEIS[nivel]
        alerta = {
            "tipo": tipo_dado,
            "motivo": f"{GRANDEZAS[tipo_dado]} {descricao}",
            "severidade": nivel,
            "status": rotulo_do_status,
        }
        return self.repo.criar({**leitura, "status_operacional": status_operacional}, alerta)
