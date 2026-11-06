import pytest

from tests.fakes import ID_CLIENTE, ID_GESTAO, ID_OPERACIONAL

NOVO = {
    "prefixo": "TR-900",
    "modelo": "GE Dash 9",
    "ano": 2021,
    "capacidade_t": 2100.0,
    "status": "ativo",
    "ultima_inspecao": "2026-10-21",
    "linha_id": 1,
}


@pytest.fixture
def gestao(como):
    return como(ID_GESTAO)


@pytest.fixture
def operacional(como):
    return como(ID_OPERACIONAL)


def prefixos(resposta):
    return [trem["prefixo"] for trem in resposta.json()]


def test_lista_ordenada_por_prefixo_com_linha_e_total_de_sensores(operacional):
    resposta = operacional.get("/api/trens")

    assert resposta.status_code == 200
    assert prefixos(resposta) == ["TR-118", "TR-204", "TR-301"]
    assert resposta.json()[0]["linha_numero"] == "2645"
    assert resposta.json()[0]["total_sensores"] == 2
    assert resposta.json()[2]["linha_numero"] is None
    assert resposta.json()[2]["total_sensores"] == 0


def test_busca_bate_em_prefixo_e_em_modelo(operacional):
    assert prefixos(operacional.get("/api/trens", params={"busca": "204"})) == ["TR-204"]
    assert prefixos(operacional.get("/api/trens", params={"busca": "EMD"})) == ["TR-118"]


def test_filtros_se_acumulam(operacional):
    por_status = operacional.get("/api/trens", params={"status": "parado"})

    assert prefixos(por_status) == ["TR-301"]
    juntos = operacional.get("/api/trens", params={"busca": "204", "status": "parado"})
    assert juntos.json() == []


def test_detalhe_devolve_o_trem_e_404_quando_nao_existe(operacional):
    assert operacional.get("/api/trens/1").json()["prefixo"] == "TR-118"
    assert operacional.get("/api/trens/999").status_code == 404


def test_gestao_cria_trem_e_ele_aparece_na_lista(gestao):
    resposta = gestao.post("/api/trens", json=NOVO)

    assert resposta.status_code == 201
    assert resposta.json()["prefixo"] == "TR-900"
    assert resposta.json()["linha_numero"] == "1778"
    assert resposta.json()["total_sensores"] == 0
    assert prefixos(gestao.get("/api/trens")) == ["TR-118", "TR-204", "TR-301", "TR-900"]


def test_status_tem_default_ativo(gestao):
    sem_status = {k: v for k, v in NOVO.items() if k != "status"}

    assert gestao.post("/api/trens", json=sem_status).json()["status"] == "ativo"


@pytest.mark.parametrize(
    "invalido",
    [
        {"ano": 1899},
        {"ano": 2101},
        {"capacidade_t": 0},
        {"capacidade_t": -1},
        {"prefixo": ""},
        {"status": "sucateado"},
    ],
)
def test_entrada_invalida_e_422(gestao, invalido):
    assert gestao.post("/api/trens", json={**NOVO, **invalido}).status_code == 422


def test_criar_sem_campo_obrigatorio_e_422(gestao):
    sem_modelo = {k: v for k, v in NOVO.items() if k != "modelo"}

    assert gestao.post("/api/trens", json=sem_modelo).status_code == 422


def test_patch_altera_so_o_que_foi_enviado(gestao):
    resposta = gestao.patch("/api/trens/3", json={"status": "ativo"})

    assert resposta.status_code == 200
    assert resposta.json()["status"] == "ativo"
    assert resposta.json()["prefixo"] == "TR-301"
    assert resposta.json()["modelo"] == "Villares V8 SD"


def test_patch_inexistente_e_404(gestao):
    assert gestao.patch("/api/trens/999", json={"status": "ativo"}).status_code == 404


def test_delete_remove_o_trem_sem_sensores(gestao):
    assert gestao.delete("/api/trens/3").status_code == 204
    assert prefixos(gestao.get("/api/trens")) == ["TR-118", "TR-204"]


def test_delete_inexistente_e_404(gestao):
    assert gestao.delete("/api/trens/999").status_code == 404


def test_prefixo_duplicado_e_409(gestao):
    repetido = gestao.post("/api/trens", json={**NOVO, "prefixo": "TR-118"})

    assert repetido.status_code == 409
    assert repetido.json() == {"detail": "Registro duplicado"}


def test_linha_inexistente_e_409(gestao):
    assert gestao.post("/api/trens", json={**NOVO, "linha_id": 99}).status_code == 409


def test_excluir_trem_com_sensores_e_409(gestao):
    resposta = gestao.delete("/api/trens/1")

    assert resposta.status_code == 409
    assert resposta.json() == {"detail": "Registro em uso por outro cadastro"}


@pytest.mark.parametrize(
    ("metodo", "rota", "corpo"),
    [
        ("get", "/api/trens", None),
        ("get", "/api/trens/1", None),
        ("post", "/api/trens", NOVO),
        ("patch", "/api/trens/1", {"status": "ativo"}),
        ("delete", "/api/trens/3", None),
    ],
)
def test_sem_cookie_e_401(client, metodo, rota, corpo):
    assert client.request(metodo, rota, json=corpo).status_code == 401


@pytest.mark.parametrize(
    ("metodo", "rota", "corpo"),
    [
        ("get", "/api/trens", None),
        ("post", "/api/trens", NOVO),
        ("patch", "/api/trens/1", {"status": "ativo"}),
        ("delete", "/api/trens/3", None),
    ],
)
def test_cliente_nao_acessa_nada(como, metodo, rota, corpo):
    assert como(ID_CLIENTE).request(metodo, rota, json=corpo).status_code == 403


@pytest.mark.parametrize(
    ("metodo", "rota", "corpo"),
    [
        ("post", "/api/trens", NOVO),
        ("patch", "/api/trens/1", {"status": "ativo"}),
        ("delete", "/api/trens/3", None),
    ],
)
def test_operacional_le_mas_nao_escreve(operacional, metodo, rota, corpo):
    assert operacional.get("/api/trens").status_code == 200
    assert operacional.request(metodo, rota, json=corpo).status_code == 403
