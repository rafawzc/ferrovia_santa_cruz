import pytest

from tests.fakes import ID_CLIENTE, ID_GESTAO, ID_OPERACIONAL, PREFIXOS

NOVA = {
    "linha_id": 2,
    "trem_id": 3,
    "partida_prevista": "2026-10-02T08:00:00",
    "chegada_prevista": "2026-10-02T11:30:00",
    "status": "programada",
}
ROTAS_LEITURA = [
    ("get", "/api/viagens", None),
    ("get", "/api/viagens/1", None),
]
ROTAS_ESCRITA = [
    ("post", "/api/viagens", NOVA),
    ("patch", "/api/viagens/1", {"status": "atrasada"}),
    ("delete", "/api/viagens/1", None),
]


@pytest.fixture
def gestao(como):
    return como(ID_GESTAO)


@pytest.fixture
def operacional(como):
    return como(ID_OPERACIONAL)


@pytest.mark.parametrize(("metodo", "rota", "corpo"), ROTAS_LEITURA + ROTAS_ESCRITA)
def test_sem_cookie_e_401(client, metodo, rota, corpo):
    assert client.request(metodo, rota, json=corpo).status_code == 401


@pytest.mark.parametrize(("metodo", "rota", "corpo"), ROTAS_LEITURA + ROTAS_ESCRITA)
def test_cliente_nunca_entra(como, metodo, rota, corpo):
    assert como(ID_CLIENTE).request(metodo, rota, json=corpo).status_code == 403


@pytest.mark.parametrize(("metodo", "rota", "corpo"), ROTAS_LEITURA)
def test_operacional_le(operacional, metodo, rota, corpo):
    assert operacional.request(metodo, rota, json=corpo).status_code == 200


@pytest.mark.parametrize(("metodo", "rota", "corpo"), ROTAS_ESCRITA)
def test_operacional_nao_escreve(operacional, metodo, rota, corpo):
    assert operacional.request(metodo, rota, json=corpo).status_code == 403


def test_lista_viagens_da_mais_recente_com_linha_e_trem_da_juncao(operacional):
    resposta = operacional.get("/api/viagens")

    assert resposta.status_code == 200
    assert [viagem["id"] for viagem in resposta.json()] == [2, 3, 1]
    assert resposta.json()[0] == {
        "id": 2,
        "linha_id": 2,
        "linha_numero": "2645",
        "origem": "Zurique",
        "destino": "Berna",
        "trem_id": 2,
        "trem_prefixo": PREFIXOS[2],
        "partida_prevista": "2026-09-23T09:00:00",
        "chegada_prevista": "2026-09-23T12:00:00",
        "status": "em_andamento",
        "criado_em": "2026-09-22T10:00:00",
    }


@pytest.mark.parametrize(
    ("consulta", "esperado"),
    [
        ("status=concluida", [3]),
        ("trem_id=2", [2]),
        ("linha_id=1", [3, 1]),
        ("data=2026-09-22", [3, 1]),
        ("linha_id=1&status=concluida", [3]),
        ("data=2026-09-22&trem_id=1", [1]),
    ],
)
def test_filtros_isolados_e_combinados(operacional, consulta, esperado):
    resposta = operacional.get(f"/api/viagens?{consulta}")

    assert [viagem["id"] for viagem in resposta.json()] == esperado


def test_detalhe_devolve_a_viagem_e_404_quando_nao_existe(gestao):
    assert gestao.get("/api/viagens/2").json()["status"] == "em_andamento"
    assert gestao.get("/api/viagens/999").status_code == 404


def test_cria_viagem_e_ela_aparece_na_lista(gestao):
    resposta = gestao.post("/api/viagens", json=NOVA)

    assert resposta.status_code == 201
    assert resposta.json()["id"] == 4
    assert resposta.json()["origem"] == "Zurique"
    assert resposta.json()["trem_prefixo"] == PREFIXOS[3]
    assert [viagem["id"] for viagem in gestao.get("/api/viagens").json()] == [4, 2, 3, 1]


def test_status_da_viagem_nasce_programada(gestao):
    sem_status = {k: v for k, v in NOVA.items() if k != "status"}

    assert gestao.post("/api/viagens", json=sem_status).json()["status"] == "programada"


def test_viagem_invalida_e_422(gestao):
    sem_trem = {k: v for k, v in NOVA.items() if k != "trem_id"}

    assert gestao.post("/api/viagens", json=sem_trem).status_code == 422
    assert gestao.post("/api/viagens", json={**NOVA, "status": "voando"}).status_code == 422
    assert gestao.get("/api/viagens?status=voando").status_code == 422


def test_linha_ou_trem_inexistente_e_409(gestao):
    sem_linha = gestao.post("/api/viagens", json={**NOVA, "linha_id": 99})

    assert sem_linha.status_code == 409
    assert sem_linha.json() == {"detail": "Referência inexistente"}
    assert gestao.post("/api/viagens", json={**NOVA, "trem_id": 99}).status_code == 409
    assert gestao.patch("/api/viagens/1", json={"trem_id": 99}).status_code == 409


def test_patch_altera_so_o_campo_enviado(gestao):
    resposta = gestao.patch("/api/viagens/1", json={"status": "atrasada"})

    assert resposta.status_code == 200
    assert resposta.json()["status"] == "atrasada"
    assert resposta.json()["trem_id"] == 1
    assert resposta.json()["partida_prevista"] == "2026-09-22T06:00:00"


def test_patch_que_troca_o_trem_refaz_a_juncao(gestao):
    resposta = gestao.patch("/api/viagens/1", json={"trem_id": 2})

    assert resposta.json()["trem_prefixo"] == PREFIXOS[2]


def test_delete_remove_da_lista(gestao):
    assert gestao.delete("/api/viagens/1").status_code == 204
    assert [viagem["id"] for viagem in gestao.get("/api/viagens").json()] == [2, 3]


def test_patch_e_delete_de_viagem_inexistente_sao_404(gestao):
    assert gestao.patch("/api/viagens/999", json={"status": "atrasada"}).status_code == 404
    assert gestao.delete("/api/viagens/999").status_code == 404
