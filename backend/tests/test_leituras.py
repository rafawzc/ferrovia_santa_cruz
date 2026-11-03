import pytest

from tests.fakes import (
    AGORA,
    CHAVE_SENSOR,
    ID_CLIENTE,
    ID_GESTAO,
    ID_OPERACIONAL,
    SENSOR_ENERGIA,
    SENSOR_FALHA,
    SENSOR_INEXISTENTE,
    SENSOR_LOCALIZACAO,
    SENSOR_TEMPERATURA,
    SENSOR_VELOCIDADE,
)

CHAVE_CERTA = {"X-API-Key": CHAVE_SENSOR}
CHAVE_ERRADA = {"X-API-Key": "chave-de-invasor"}


def envia(client, valor, sensor_id=SENSOR_TEMPERATURA, headers=CHAVE_CERTA):
    corpo = {"sensor_id": sensor_id, "valor": valor}
    return client.post("/api/leituras", json=corpo, headers=headers)


def test_ingestao_sem_chave_e_401(client):
    assert envia(client, 70.0, headers={}).status_code == 401
    assert client.get("/api/leituras/sensores").status_code == 401


def test_ingestao_com_chave_errada_e_401(client):
    assert envia(client, 70.0, headers=CHAVE_ERRADA).status_code == 401
    assert client.get("/api/leituras/sensores", headers=CHAVE_ERRADA).status_code == 401


def test_leitura_normal_nasce_sem_alerta(client, leituras):
    resposta = envia(client, 70.0)

    assert resposta.status_code == 201
    assert resposta.json() == {
        "id": 1,
        "sensor_id": SENSOR_TEMPERATURA,
        "valor": 70.0,
        "status_operacional": "normal",
        "data_hora": AGORA,
        "alerta_id": None,
    }
    assert leituras.alertas == []


def test_acima_do_limite_de_atencao_gera_alerta_de_atencao(client, leituras):
    corpo = envia(client, 100.0).json()

    assert corpo["status_operacional"] == "alerta"
    assert corpo["alerta_id"] == 1
    assert leituras.alertas == [
        {
            "id": 1,
            "leitura_id": corpo["id"],
            "tipo": "temperatura",
            "motivo": "Temperatura do motor acima do limite de atencao",
            "status": "Atencao",
        }
    ]


def test_acima_do_limite_critico_gera_alerta_critico(client, leituras):
    corpo = envia(client, 120.0).json()

    assert corpo["status_operacional"] == "falha"
    assert corpo["alerta_id"] == 1
    assert leituras.alertas == [
        {
            "id": 1,
            "leitura_id": corpo["id"],
            "tipo": "temperatura",
            "motivo": "Temperatura do motor acima do limite critico",
            "status": "Critico",
        }
    ]


def test_sensor_de_localizacao_nunca_gera_alerta(client, leituras):
    corpo = envia(client, 9999.0, SENSOR_LOCALIZACAO).json()

    assert corpo["status_operacional"] == "normal"
    assert corpo["alerta_id"] is None
    assert leituras.alertas == []


def test_limite_depende_do_tipo_do_sensor(client):
    assert envia(client, 92.0, SENSOR_VELOCIDADE).json()["status_operacional"] == "alerta"
    assert envia(client, 92.0, SENSOR_TEMPERATURA).json()["status_operacional"] == "normal"


@pytest.mark.parametrize(
    ("sensor_id", "valor", "esperado"),
    [
        (SENSOR_VELOCIDADE, 90.0, "normal"),
        (SENSOR_VELOCIDADE, 95.0, "alerta"),
        (SENSOR_VELOCIDADE, 120.0, "falha"),
        (SENSOR_ENERGIA, 390.0, "normal"),
        (SENSOR_ENERGIA, 450.0, "alerta"),
        (SENSOR_ENERGIA, 520.0, "falha"),
        (SENSOR_FALHA, 0.4, "normal"),
        (SENSOR_FALHA, 0.7, "alerta"),
        (SENSOR_FALHA, 0.95, "falha"),
    ],
)
def test_status_derivado_do_limite_do_tipo(client, sensor_id, valor, esperado):
    assert envia(client, valor, sensor_id).json()["status_operacional"] == esperado


def test_sensor_inexistente_e_409(client):
    assert envia(client, 70.0, SENSOR_INEXISTENTE).status_code == 409


def test_leitura_sem_valor_e_422(client):
    corpo = {"sensor_id": SENSOR_TEMPERATURA}

    assert client.post("/api/leituras", json=corpo, headers=CHAVE_CERTA).status_code == 422


def test_status_operacional_do_cliente_e_ignorado(client):
    corpo = {"sensor_id": SENSOR_TEMPERATURA, "valor": 120.0, "status_operacional": "normal"}
    resposta = client.post("/api/leituras", json=corpo, headers=CHAVE_CERTA)

    assert resposta.json()["status_operacional"] == "falha"


def test_lista_sensores_para_o_simulador(client):
    resposta = client.get("/api/leituras/sensores", headers=CHAVE_CERTA)

    assert resposta.status_code == 200
    assert {"id": SENSOR_VELOCIDADE, "tipo_dado": "velocidade"} in resposta.json()


def test_lista_leituras_com_e_sem_filtro_de_sensor(como):
    equipe = como(ID_OPERACIONAL)
    envia(equipe, 70.0, SENSOR_TEMPERATURA)
    envia(equipe, 50.0, SENSOR_VELOCIDADE)

    todas = equipe.get("/api/leituras").json()

    assert todas[0] == {
        "id": 2,
        "sensor_id": SENSOR_VELOCIDADE,
        "sensor_codigo": f"S-{SENSOR_VELOCIDADE}",
        "trem_prefixo": "TR-204",
        "valor": 50.0,
        "status_operacional": "normal",
        "data_hora": AGORA,
    }
    assert len(todas) == 2

    filtradas = equipe.get("/api/leituras", params={"sensor_id": SENSOR_TEMPERATURA}).json()

    assert [leitura["sensor_id"] for leitura in filtradas] == [SENSOR_TEMPERATURA]


def test_limite_respeita_default_e_teto(como):
    equipe = como(ID_OPERACIONAL)
    for _ in range(3):
        envia(equipe, 70.0)

    assert len(equipe.get("/api/leituras").json()) == 3
    assert len(equipe.get("/api/leituras", params={"limite": 2}).json()) == 2
    assert equipe.get("/api/leituras", params={"limite": 500}).status_code == 200
    assert equipe.get("/api/leituras", params={"limite": 501}).status_code == 422
    assert equipe.get("/api/leituras", params={"limite": 0}).status_code == 422


def test_listagem_exige_papel_da_equipe(client, como):
    assert client.get("/api/leituras").status_code == 401
    assert como(ID_CLIENTE).get("/api/leituras").status_code == 403
    assert como(ID_OPERACIONAL).get("/api/leituras").status_code == 200
    assert como(ID_GESTAO).get("/api/leituras").status_code == 200


def test_chave_de_sensor_nao_abre_a_listagem(client):
    assert client.get("/api/leituras", headers=CHAVE_CERTA).status_code == 401
