from tests.fakes import ID_CLIENTE, ID_OPERACIONAL


def test_metricas_do_dashboard_pra_equipe(como):
    resposta = como(ID_OPERACIONAL).get("/api/dashboard")

    assert resposta.status_code == 200
    assert resposta.json() == {
        "linhas_ativas": 3,
        "linhas_em_manutencao": 1,
        "sensores": 4,
        "velocidade_media": 90.4,
    }


def test_dashboard_barra_cliente_e_anonimo(client, como):
    assert client.get("/api/dashboard").status_code == 401
    assert como(ID_CLIENTE).get("/api/dashboard").status_code == 403
