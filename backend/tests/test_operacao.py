import pytest

from tests.fakes import ID_CLIENTE, ID_GESTAO, ID_OPERACIONAL

CARGA = {
    "tipo": "Areia",
    "peso_t": 31.2,
    "local_partida": "Genebra",
    "destino": "Zermatt",
    "vagao": "C",
    "trem_id": None,
}
ALERTA = {
    "linha_id": 2,
    "tipo": "atraso_de_linha",
    "severidade": "atencao",
    "tempo_espera": "5 a 10 min",
    "motivo": "atraso",
    "status": "Atraso",
}
LINHA = {
    "numero": "3321",
    "origem": "Interlaken",
    "destino": "Grindelwald",
    "status": "na_estacao",
    "ativo": True,
}
ROTAS = [
    ("get", "/api/linhas", None),
    ("get", "/api/cargas", None),
    ("post", "/api/cargas", CARGA),
    ("get", "/api/alertas", None),
    ("post", "/api/alertas", ALERTA),
    ("patch", "/api/alertas/1", {"tratado": True}),
]
ROTAS_SO_GESTAO = [
    ("post", "/api/linhas", LINHA),
    ("patch", "/api/linhas/1", {"status": "atraso"}),
    ("delete", "/api/linhas/3", None),
]


@pytest.fixture
def operacional(como):
    return como(ID_OPERACIONAL)


@pytest.fixture
def gestao(como):
    return como(ID_GESTAO)


@pytest.mark.parametrize(("metodo", "rota", "corpo"), ROTAS)
def test_equipe_acessa_e_cliente_nao(como, metodo, rota, corpo):
    for usuario_id in (ID_GESTAO, ID_OPERACIONAL):
        resposta = como(usuario_id).request(metodo, rota, json=corpo)
        assert resposta.status_code in (200, 201)

    assert como(ID_CLIENTE).request(metodo, rota, json=corpo).status_code == 403


@pytest.mark.parametrize(("metodo", "rota", "corpo"), ROTAS)
def test_sem_cookie_e_401(client, metodo, rota, corpo):
    assert client.request(metodo, rota, json=corpo).status_code == 401


def test_lista_linhas_com_status_do_banco(operacional):
    resposta = operacional.get("/api/linhas")

    assert resposta.json()[0] == {
        "id": 1,
        "numero": "1778",
        "origem": "Genebra",
        "destino": "Zermatt",
        "status": "manutencao",
        "ativo": True,
    }


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


@pytest.mark.parametrize(("metodo", "rota", "corpo"), ROTAS_SO_GESTAO)
def test_so_a_gestao_escreve_linha(como, metodo, rota, corpo):
    assert como(ID_OPERACIONAL).request(metodo, rota, json=corpo).status_code == 403
    assert como(ID_CLIENTE).request(metodo, rota, json=corpo).status_code == 403
    assert como(ID_GESTAO).request(metodo, rota, json=corpo).status_code in (200, 201, 204)


@pytest.mark.parametrize(("metodo", "rota", "corpo"), ROTAS_SO_GESTAO)
def test_escrita_de_linha_sem_cookie_e_401(client, metodo, rota, corpo):
    assert client.request(metodo, rota, json=corpo).status_code == 401


def test_filtra_linha_por_status(operacional):
    resposta = operacional.get("/api/linhas?status=atraso")

    assert [linha["id"] for linha in resposta.json()] == [2]
    assert operacional.get("/api/linhas?status=derretida").status_code == 422


def test_cria_linha_e_ela_aparece_na_lista(gestao):
    resposta = gestao.post("/api/linhas", json=LINHA)

    assert resposta.status_code == 201
    assert resposta.json() == {**LINHA, "id": 4}
    assert len(gestao.get("/api/linhas").json()) == 4


def test_linha_invalida_e_422_e_numero_repetido_e_409(gestao):
    sem_origem = {k: v for k, v in LINHA.items() if k != "origem"}

    assert gestao.post("/api/linhas", json=sem_origem).status_code == 422
    assert gestao.post("/api/linhas", json={**LINHA, "numero": ""}).status_code == 422
    assert gestao.post("/api/linhas", json={**LINHA, "status": "derretida"}).status_code == 422
    repetida = gestao.post("/api/linhas", json={**LINHA, "numero": "1778"})
    assert repetida.status_code == 409
    assert repetida.json() == {"detail": "Registro duplicado"}


def test_patch_de_linha_altera_so_o_campo_enviado(gestao):
    resposta = gestao.patch("/api/linhas/1", json={"status": "ja_partiu"})

    assert resposta.status_code == 200
    assert resposta.json()["status"] == "ja_partiu"
    assert resposta.json()["numero"] == "1778"
    assert resposta.json()["origem"] == "Genebra"


def test_delete_remove_a_linha_da_lista(gestao):
    assert gestao.delete("/api/linhas/3").status_code == 204
    assert [linha["id"] for linha in gestao.get("/api/linhas").json()] == [1, 2]


def test_patch_e_delete_de_linha_inexistente_sao_404(gestao):
    assert gestao.patch("/api/linhas/999", json={"ativo": False}).status_code == 404
    assert gestao.delete("/api/linhas/999").status_code == 404


def test_alerta_automatico_sem_linha_aparece_na_listagem(operacional):
    resposta = operacional.get("/api/alertas")

    automatico = next(alerta for alerta in resposta.json() if alerta["id"] == 2)
    assert automatico["linha_id"] is None
    assert automatico["linha_numero"] is None
    assert automatico["leitura_id"] == 7
    assert automatico["severidade"] == "critico"
    assert automatico["tipo"] == "temperatura"


@pytest.mark.parametrize(
    ("consulta", "esperado"),
    [
        ("severidade=critico", [2]),
        ("tipo=manual", [1]),
        ("tratado=false", [2]),
        ("tratado=true", [1]),
        ("severidade=critico&tratado=false", [2]),
        ("tipo=temperatura&severidade=normal", []),
    ],
)
def test_filtra_alertas_isolado_e_combinado(operacional, consulta, esperado):
    resposta = operacional.get(f"/api/alertas?{consulta}")

    assert [alerta["id"] for alerta in resposta.json()] == esperado


def test_cria_alerta_manual_com_tipo_e_severidade(operacional):
    resposta = operacional.post("/api/alertas", json=ALERTA)

    assert resposta.status_code == 201
    assert resposta.json()["tipo"] == "atraso_de_linha"
    assert resposta.json()["severidade"] == "atencao"
    assert resposta.json()["tratado"] is False
    assert resposta.json()["leitura_id"] is None


def test_severidade_do_alerta_nasce_normal(operacional):
    sem_severidade = {k: v for k, v in ALERTA.items() if k != "severidade"}

    resposta = operacional.post("/api/alertas", json=sem_severidade)

    assert resposta.json()["severidade"] == "normal"


def test_alerta_sem_tipo_ou_com_severidade_invalida_e_422(operacional):
    sem_tipo = {k: v for k, v in ALERTA.items() if k != "tipo"}
    severa = {**ALERTA, "severidade": "urgente"}

    assert operacional.post("/api/alertas", json=sem_tipo).status_code == 422
    assert operacional.post("/api/alertas", json=severa).status_code == 422
    assert operacional.get("/api/alertas?severidade=urgente").status_code == 422


def test_marca_alerta_como_tratado(operacional):
    resposta = operacional.patch("/api/alertas/2", json={"tratado": True})

    assert resposta.status_code == 200
    assert resposta.json()["tratado"] is True
    tratados = operacional.get("/api/alertas?tratado=true").json()
    assert [alerta["id"] for alerta in tratados] == [2, 1]


def test_patch_de_alerta_inexistente_e_404_e_corpo_vazio_e_422(operacional):
    assert operacional.patch("/api/alertas/999", json={"tratado": True}).status_code == 404
    assert operacional.patch("/api/alertas/1", json={}).status_code == 422
