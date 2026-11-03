import csv
import io

import pytest

from tests.fakes import ID_CLIENTE, ID_GESTAO, ID_OPERACIONAL

PERIODO = {"inicio": "2026-10-01", "fim": "2026-10-31"}
PERIODO_VAZIO = {"inicio": "2026-01-01", "fim": "2026-01-31"}
TIPOS = ["desempenho", "consumo", "eficiencia", "manutencao"]
CHAVE_DO_GRAFICO = {
    "desempenho": "velocidade_media",
    "consumo": "consumo_total",
    "eficiencia": "concluidas",
    "manutencao": "total_alertas",
}
ROTAS = ["/api/relatorios", "/api/relatorios/csv"]


@pytest.fixture
def gestao(como):
    return como(ID_GESTAO)


def pedir(cliente, tipo, **extra):
    return cliente.get("/api/relatorios", params={"tipo": tipo, **PERIODO, **extra})


def baixar(cliente, tipo, **extra):
    return cliente.get("/api/relatorios/csv", params={"tipo": tipo, **PERIODO, **extra})


@pytest.mark.parametrize("tipo", TIPOS)
def test_envelope_tem_sempre_a_mesma_forma(gestao, tipo):
    resposta = pedir(gestao, tipo)

    assert resposta.status_code == 200
    corpo = resposta.json()
    assert corpo["tipo"] == tipo
    assert corpo["inicio"] == "2026-10-01"
    assert corpo["fim"] == "2026-10-31"
    assert corpo["trem_id"] is None
    assert corpo["colunas"][0] == {"chave": "trem_prefixo", "rotulo": "Trem"}
    assert corpo["linhas"]
    assert corpo["grafico"]["rotulo"]


@pytest.mark.parametrize("tipo", TIPOS)
def test_toda_linha_traz_exatamente_as_colunas_declaradas(gestao, tipo):
    corpo = pedir(gestao, tipo).json()
    chaves = [coluna["chave"] for coluna in corpo["colunas"]]

    for linha in corpo["linhas"]:
        assert sorted(linha) == sorted(chaves)


@pytest.mark.parametrize("tipo", TIPOS)
def test_grafico_repete_a_tabela_reduzida_a_rotulo_e_valor(gestao, tipo):
    corpo = pedir(gestao, tipo).json()
    chave = CHAVE_DO_GRAFICO[tipo]

    assert corpo["grafico"]["itens"] == [
        {"rotulo": linha["trem_prefixo"], "valor": linha[chave]} for linha in corpo["linhas"]
    ]


def test_grafico_de_contagem_continua_inteiro(gestao):
    itens = pedir(gestao, "eficiencia").json()["grafico"]["itens"]

    assert [item["valor"] for item in itens] == [1, 2]
    assert all(isinstance(item["valor"], int) for item in itens)


def test_desempenho_traz_media_e_maxima_por_trem(gestao):
    assert pedir(gestao, "desempenho").json()["linhas"] == [
        {"trem_prefixo": "TR-118", "velocidade_media": 72.4, "velocidade_maxima": 81.1},
        {"trem_prefixo": "TR-204", "velocidade_media": 78.5, "velocidade_maxima": 94.6},
    ]


def test_consumo_traz_total_e_media_por_trem(gestao):
    assert pedir(gestao, "consumo").json()["linhas"] == [
        {"trem_prefixo": "TR-204", "consumo_total": 738.7, "consumo_medio": 369.35}
    ]


def test_eficiencia_conta_concluidas_canceladas_e_atrasadas(gestao):
    assert pedir(gestao, "eficiencia").json()["linhas"][0] == {
        "trem_prefixo": "TR-118",
        "concluidas": 1,
        "canceladas": 0,
        "atrasadas": 1,
    }


def test_manutencao_quebra_por_severidade_e_traz_a_ultima_inspecao(gestao):
    assert pedir(gestao, "manutencao").json()["linhas"][1] == {
        "trem_prefixo": "TR-204",
        "total_alertas": 2,
        "criticos": 1,
        "atencao": 1,
        "normais": 0,
        "ultima_inspecao": "2026-09-14",
    }


def test_filtro_por_trem_restringe_tabela_e_grafico(gestao):
    corpo = pedir(gestao, "desempenho", trem_id=2).json()

    assert corpo["trem_id"] == 2
    assert [linha["trem_prefixo"] for linha in corpo["linhas"]] == ["TR-204"]
    assert corpo["grafico"]["itens"] == [{"rotulo": "TR-204", "valor": 78.5}]


@pytest.mark.parametrize("tipo", TIPOS)
def test_periodo_sem_dado_devolve_tabela_e_grafico_vazios(gestao, tipo):
    resposta = gestao.get("/api/relatorios", params={"tipo": tipo, **PERIODO_VAZIO})

    assert resposta.status_code == 200
    assert resposta.json()["linhas"] == []
    assert resposta.json()["grafico"]["itens"] == []
    assert resposta.json()["colunas"]


def test_tipo_invalido_e_422(gestao):
    assert pedir(gestao, "financeiro").status_code == 422


def test_tipo_ausente_e_422(gestao):
    assert gestao.get("/api/relatorios", params=PERIODO).status_code == 422


@pytest.mark.parametrize("faltando", ["inicio", "fim"])
def test_periodo_e_obrigatorio(gestao, faltando):
    periodo = {chave: valor for chave, valor in PERIODO.items() if chave != faltando}

    assert (
        gestao.get("/api/relatorios", params={"tipo": "desempenho", **periodo}).status_code == 422
    )


def test_data_que_nao_e_data_e_422(gestao):
    resposta = gestao.get(
        "/api/relatorios", params={"tipo": "desempenho", "inicio": "ontem", "fim": "2026-10-31"}
    )

    assert resposta.status_code == 422


@pytest.mark.parametrize("tipo", TIPOS)
def test_csv_tem_cabecalho_dos_rotulos_e_uma_linha_por_registro(gestao, tipo):
    resposta = baixar(gestao, tipo)
    corpo = pedir(gestao, tipo).json()

    assert resposta.status_code == 200
    assert resposta.headers["content-type"] == "text/csv; charset=utf-8"
    assert (
        resposta.headers["content-disposition"]
        == f"attachment; filename=relatorio-{tipo}-2026-10-01-2026-10-31.csv"
    )
    registros = list(csv.reader(io.StringIO(resposta.content.decode("utf-8-sig"))))
    assert registros[0] == [coluna["rotulo"] for coluna in corpo["colunas"]]
    assert len(registros) == len(corpo["linhas"]) + 1


def test_csv_comeca_com_bom_e_preserva_a_acentuacao(gestao):
    conteudo = baixar(gestao, "desempenho").content

    assert conteudo.startswith(b"\xef\xbb\xbf")
    assert "Velocidade média (km/h)" in conteudo.decode("utf-8-sig")


def test_csv_de_periodo_vazio_tem_so_o_cabecalho(gestao):
    resposta = gestao.get("/api/relatorios/csv", params={"tipo": "consumo", **PERIODO_VAZIO})
    registros = list(csv.reader(io.StringIO(resposta.content.decode("utf-8-sig"))))

    assert registros == [["Trem", "Consumo total", "Consumo médio"]]


def test_csv_respeita_o_filtro_por_trem(gestao):
    registros = list(
        csv.reader(io.StringIO(baixar(gestao, "desempenho", trem_id=2).content.decode("utf-8-sig")))
    )

    assert registros[1] == ["TR-204", "78.5", "94.6"]


def test_csv_de_tipo_invalido_e_422(gestao):
    assert baixar(gestao, "financeiro").status_code == 422


@pytest.mark.parametrize("rota", ROTAS)
def test_sem_cookie_e_401(client, rota):
    assert client.get(rota, params={"tipo": "desempenho", **PERIODO}).status_code == 401


@pytest.mark.parametrize("usuario_id", [ID_OPERACIONAL, ID_CLIENTE])
@pytest.mark.parametrize("rota", ROTAS)
def test_so_gestao_gera_relatorio(como, rota, usuario_id):
    resposta = como(usuario_id).get(rota, params={"tipo": "desempenho", **PERIODO})

    assert resposta.status_code == 403
