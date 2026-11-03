from tests.fakes import (
    ID_CLIENTE,
    ID_GESTAO,
    ID_OPERACIONAL,
    ID_OPERACIONAL_SEM_LEITURA,
    ID_OPERACIONAL_SEM_TREM,
)


def test_gestao_ve_os_cinco_indicadores_da_frota(como):
    resposta = como(ID_GESTAO).get("/api/dashboard")

    assert resposta.status_code == 200
    assert resposta.json() == {
        "trens_por_status": [
            {"status": "ativo", "quantidade": 2},
            {"status": "manutencao", "quantidade": 1},
        ],
        "alertas_ativos_por_severidade": [
            {"severidade": "atencao", "quantidade": 1},
            {"severidade": "critico", "quantidade": 3},
        ],
        "sensores_criticos": 2,
        "viagens_em_andamento": 4,
        "velocidade_media": 72.5,
    }


def test_operacional_ve_so_o_trem_que_opera(como):
    resposta = como(ID_OPERACIONAL).get("/api/dashboard")

    assert resposta.status_code == 200
    assert resposta.json() == {
        "trens_por_status": [{"status": "ativo", "quantidade": 1}],
        "alertas_ativos_por_severidade": [{"severidade": "critico", "quantidade": 1}],
        "sensores_criticos": 1,
        "viagens_em_andamento": 2,
        "velocidade_media": 68.0,
    }


def test_operacional_sem_trem_vinculado_recebe_painel_vazio_sem_erro(como):
    resposta = como(ID_OPERACIONAL_SEM_TREM).get("/api/dashboard")

    assert resposta.status_code == 200
    assert resposta.json() == {
        "trens_por_status": [],
        "alertas_ativos_por_severidade": [],
        "sensores_criticos": 0,
        "viagens_em_andamento": 0,
        "velocidade_media": None,
    }


def test_cliente_ve_so_viagens_em_andamento(como):
    resposta = como(ID_CLIENTE).get("/api/dashboard")

    assert resposta.status_code == 200
    assert resposta.json() == {
        "trens_por_status": None,
        "alertas_ativos_por_severidade": None,
        "sensores_criticos": None,
        "viagens_em_andamento": 4,
        "velocidade_media": None,
    }


def test_sem_leitura_na_janela_a_velocidade_media_e_nula_e_nao_zero(como):
    corpo = como(ID_OPERACIONAL_SEM_LEITURA).get("/api/dashboard").json()

    assert corpo["velocidade_media"] is None
    assert corpo["sensores_criticos"] == 0
    assert corpo["viagens_em_andamento"] == 0


def test_dashboard_sem_cookie_e_401(client):
    assert client.get("/api/dashboard").status_code == 401
