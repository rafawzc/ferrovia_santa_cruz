import pytest

from tests.fakes import ID_CLIENTE, ID_GESTAO, ID_OPERACIONAL

NOVO = {
    "codigo": "S-ENE-001",
    "nome": "Consumo de energia",
    "tipo_dado": "energia",
    "localizacao": "Motor",
    "segmento": "Mafra - Porto Uniao",
    "trem_id": 3,
}


@pytest.fixture
def gestao(como):
    return como(ID_GESTAO)


@pytest.fixture
def operacional(como):
    return como(ID_OPERACIONAL)


def codigos(resposta):
    return [sensor["codigo"] for sensor in resposta.json()]


def test_lista_ordenada_por_trem_e_codigo_com_dados_do_trem(operacional):
    resposta = operacional.get("/api/sensores")

    assert resposta.status_code == 200
    assert codigos(resposta) == ["S-TEMP-001", "S-VEL-001", "S-LOC-001"]
    assert resposta.json()[0]["trem_prefixo"] == "TR-118"
    assert resposta.json()[0]["trem_modelo"] == "EMD SD70M"
    assert resposta.json()[2]["trem_prefixo"] == "TR-204"


def test_ultima_leitura_chega_nula_quando_o_sensor_nunca_mediu(operacional):
    sem_leitura = operacional.get("/api/sensores/3").json()

    assert sem_leitura["ultima_leitura_status"] is None
    assert sem_leitura["ultima_leitura_valor"] is None
    assert sem_leitura["ultima_leitura_data"] is None


def test_ultima_leitura_vem_da_medicao_mais_recente(operacional):
    com_leitura = operacional.get("/api/sensores/1").json()

    assert com_leitura["ultima_leitura_status"] == "alerta"
    assert com_leitura["ultima_leitura_valor"] == 94.6
    assert com_leitura["ultima_leitura_data"] == "2026-09-22T10:00:00"


def test_filtra_por_tipo_e_por_trem(operacional):
    por_tipo = operacional.get("/api/sensores", params={"tipo": "velocidade"})
    por_trem = operacional.get("/api/sensores", params={"trem_id": 1})

    assert codigos(por_tipo) == ["S-VEL-001"]
    assert codigos(por_trem) == ["S-TEMP-001", "S-VEL-001"]


def test_detalhe_e_404_quando_nao_existe(operacional):
    assert operacional.get("/api/sensores/999").status_code == 404


def test_gestao_cria_sensor_e_ele_aparece_na_lista(gestao):
    resposta = gestao.post("/api/sensores", json=NOVO)

    assert resposta.status_code == 201
    assert resposta.json()["trem_prefixo"] == "TR-301"
    assert resposta.json()["ultima_leitura_status"] is None
    assert codigos(gestao.get("/api/sensores")) == [
        "S-TEMP-001",
        "S-VEL-001",
        "S-LOC-001",
        "S-ENE-001",
    ]


@pytest.mark.parametrize(
    "invalido",
    [{"tipo_dado": "umidade"}, {"codigo": ""}, {"nome": ""}, {"localizacao": ""}],
)
def test_entrada_invalida_e_422(gestao, invalido):
    assert gestao.post("/api/sensores", json={**NOVO, **invalido}).status_code == 422


def test_criar_sem_trem_e_422(gestao):
    sem_trem = {k: v for k, v in NOVO.items() if k != "trem_id"}

    assert gestao.post("/api/sensores", json=sem_trem).status_code == 422


def test_patch_altera_so_o_que_foi_enviado(gestao):
    resposta = gestao.patch("/api/sensores/3", json={"localizacao": "Teto da cabine"})

    assert resposta.status_code == 200
    assert resposta.json()["localizacao"] == "Teto da cabine"
    assert resposta.json()["codigo"] == "S-LOC-001"
    assert resposta.json()["tipo_dado"] == "localizacao"


def test_patch_inexistente_e_404(gestao):
    assert gestao.patch("/api/sensores/999", json={"nome": "X"}).status_code == 404


def test_delete_remove_o_sensor_sem_leitura(gestao):
    assert gestao.delete("/api/sensores/3").status_code == 204
    assert codigos(gestao.get("/api/sensores")) == ["S-TEMP-001", "S-VEL-001"]


def test_delete_inexistente_e_404(gestao):
    assert gestao.delete("/api/sensores/999").status_code == 404


def test_codigo_duplicado_e_409(gestao):
    repetido = gestao.post("/api/sensores", json={**NOVO, "codigo": "S-VEL-001"})

    assert repetido.status_code == 409
    assert repetido.json() == {"detail": "Registro duplicado"}


def test_trem_inexistente_e_409(gestao):
    assert gestao.post("/api/sensores", json={**NOVO, "trem_id": 99}).status_code == 409


def test_excluir_sensor_com_leitura_e_409(gestao):
    resposta = gestao.delete("/api/sensores/1")

    assert resposta.status_code == 409
    assert resposta.json() == {"detail": "Registro em uso por outro cadastro"}


@pytest.mark.parametrize(
    ("metodo", "rota", "corpo"),
    [
        ("get", "/api/sensores", None),
        ("get", "/api/sensores/1", None),
        ("post", "/api/sensores", NOVO),
        ("patch", "/api/sensores/1", {"nome": "X"}),
        ("delete", "/api/sensores/3", None),
    ],
)
def test_sem_cookie_e_401(client, metodo, rota, corpo):
    assert client.request(metodo, rota, json=corpo).status_code == 401


@pytest.mark.parametrize(
    ("metodo", "rota", "corpo"),
    [
        ("get", "/api/sensores", None),
        ("post", "/api/sensores", NOVO),
        ("patch", "/api/sensores/1", {"nome": "X"}),
        ("delete", "/api/sensores/3", None),
    ],
)
def test_cliente_nao_acessa_nada(como, metodo, rota, corpo):
    assert como(ID_CLIENTE).request(metodo, rota, json=corpo).status_code == 403


@pytest.mark.parametrize(
    ("metodo", "rota", "corpo"),
    [
        ("post", "/api/sensores", NOVO),
        ("patch", "/api/sensores/1", {"nome": "X"}),
        ("delete", "/api/sensores/3", None),
    ],
)
def test_operacional_le_mas_nao_escreve(operacional, metodo, rota, corpo):
    assert operacional.get("/api/sensores").status_code == 200
    assert operacional.request(metodo, rota, json=corpo).status_code == 403
