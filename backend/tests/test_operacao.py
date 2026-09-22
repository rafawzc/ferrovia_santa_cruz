import pytest

from tests.fakes import CLIENTE, GESTAO, OPERACIONAL

CARGA = {
    "tipo": "Areia",
    "peso_t": 31.2,
    "local_partida": "Genebra",
    "destino": "Zermatt",
    "vagao": "C",
    "trem_id": None,
}
ALERTA = {"linha_id": 2, "tempo_espera": "5 a 10 min", "motivo": "atraso", "status": "Atraso"}
ROTAS = [
    ("get", "/api/linhas", None),
    ("get", "/api/cargas", None),
    ("post", "/api/cargas", CARGA),
    ("get", "/api/alertas", None),
    ("post", "/api/alertas", ALERTA),
]


@pytest.fixture
def operacional(como):
    return como(OPERACIONAL)


@pytest.mark.parametrize(("metodo", "rota", "corpo"), ROTAS)
def test_equipe_acessa_e_cliente_nao(como, metodo, rota, corpo):
    for usuario_id in (GESTAO, OPERACIONAL):
        resposta = como(usuario_id).request(metodo, rota, json=corpo)
        assert resposta.status_code in (200, 201)

    assert como(CLIENTE).request(metodo, rota, json=corpo).status_code == 403


@pytest.mark.parametrize(("metodo", "rota", "corpo"), ROTAS)
def test_sem_cookie_e_401(client, metodo, rota, corpo):
    assert client.request(metodo, rota, json=corpo).status_code == 401


def test_lista_linhas_com_status_do_banco(operacional):
    resposta = operacional.get("/api/linhas")

    assert resposta.json()[0] == {"id": 1, "numero": "1778", "status": "manutencao", "ativo": True}


def test_cria_carga_e_ela_aparece_na_lista(operacional):
    resposta = operacional.post("/api/cargas", json=CARGA)

    assert resposta.status_code == 201
    assert resposta.json() == {**CARGA, "id": 2, "criado_em": "2026-09-22T10:00:00"}
    assert len(operacional.get("/api/cargas").json()) == 2


def test_carga_invalida_e_422_e_trem_inexistente_e_409(operacional):
    assert operacional.post("/api/cargas", json={**CARGA, "peso_t": 0}).status_code == 422
    assert operacional.post("/api/cargas", json={**CARGA, "tipo": ""}).status_code == 422
    assert operacional.post("/api/cargas", json={**CARGA, "trem_id": 99}).status_code == 409


def test_cria_alerta_com_o_numero_da_linha(operacional):
    resposta = operacional.post("/api/alertas", json=ALERTA)

    assert resposta.status_code == 201
    assert resposta.json()["linha_numero"] == "2645"
    assert operacional.get("/api/alertas").json()[0]["id"] == resposta.json()["id"]


def test_alerta_sem_motivo_e_422_e_linha_inexistente_e_409(operacional):
    sem_motivo = {k: v for k, v in ALERTA.items() if k != "motivo"}

    assert operacional.post("/api/alertas", json=sem_motivo).status_code == 422
    assert operacional.post("/api/alertas", json={**ALERTA, "linha_id": 99}).status_code == 409
