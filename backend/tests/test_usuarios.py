import pytest

from tests.fakes import CLIENTE, GESTAO, OPERACIONAL, SENHA

NOVO = {
    "nome": "Sergio Santana",
    "email": "sergio@ferrovia.com",
    "senha": "senhaforte",
    "cargo_id": 5,
    "telefone": "47999990009",
}


@pytest.fixture
def gestao(como):
    return como(GESTAO)


def test_gestao_lista_usuarios_sem_expor_hash(gestao):
    resposta = gestao.get("/api/usuarios")

    assert resposta.status_code == 200
    assert [u["email"] for u in resposta.json()][:2] == ["ana@ferrovia.com", "carlos@ferrovia.com"]
    assert all("senha_hash" not in u for u in resposta.json())


@pytest.mark.parametrize("usuario_id", [OPERACIONAL, CLIENTE])
def test_quem_nao_e_gestao_leva_403(como, usuario_id):
    cliente = como(usuario_id)

    assert cliente.get("/api/usuarios").status_code == 403
    assert cliente.post("/api/usuarios", json=NOVO).status_code == 403
    assert cliente.get("/api/cargos").status_code == 403


def test_sem_cookie_leva_401(client):
    assert client.get("/api/usuarios").status_code == 401


def test_detalhe_e_404_quando_nao_existe(gestao):
    assert gestao.get(f"/api/usuarios/{OPERACIONAL}").json()["nome"] == "Carlos Souza"
    assert gestao.get("/api/usuarios/999").status_code == 404


def test_cria_funcionario_que_consegue_logar(gestao, client):
    resposta = gestao.post("/api/usuarios", json=NOVO)

    assert resposta.status_code == 201
    assert resposta.json()["papel"] == "operacional"
    assert resposta.json()["telefone"] == "47999990009"
    login = client.post("/api/auth/login", json={"email": NOVO["email"], "senha": "senhaforte"})
    assert login.status_code == 200


def test_criar_com_email_repetido_ou_cargo_inexistente_e_409(gestao):
    repetido = gestao.post("/api/usuarios", json={**NOVO, "email": "ana@ferrovia.com"})
    sem_cargo = gestao.post("/api/usuarios", json={**NOVO, "cargo_id": 99})

    assert repetido.status_code == sem_cargo.status_code == 409
    assert sem_cargo.json() == {"detail": "Referência inexistente"}


def test_criar_sem_cargo_ou_com_senha_curta_e_422(gestao):
    sem_cargo = {k: v for k, v in NOVO.items() if k != "cargo_id"}

    assert gestao.post("/api/usuarios", json=sem_cargo).status_code == 422
    assert gestao.post("/api/usuarios", json={**NOVO, "senha": "curta"}).status_code == 422


def test_edita_so_os_campos_enviados_e_troca_a_senha(gestao, client):
    resposta = gestao.patch(
        f"/api/usuarios/{OPERACIONAL}", json={"telefone": "4733330000", "senha": "novasenha1"}
    )

    assert resposta.status_code == 200
    assert resposta.json()["telefone"] == "4733330000"
    assert resposta.json()["nome"] == "Carlos Souza"
    corpo = {"email": "carlos@ferrovia.com", "senha": SENHA}
    assert client.post("/api/auth/login", json=corpo).status_code == 401
    corpo["senha"] = "novasenha1"
    assert client.post("/api/auth/login", json=corpo).status_code == 200


def test_editar_inexistente_e_404_e_email_repetido_e_409(gestao):
    assert gestao.patch("/api/usuarios/999", json={"nome": "X"}).status_code == 404
    repetido = gestao.patch(f"/api/usuarios/{OPERACIONAL}", json={"email": "ana@ferrovia.com"})
    assert repetido.status_code == 409


def test_desativar_bloqueia_o_login(gestao, client):
    assert gestao.delete(f"/api/usuarios/{OPERACIONAL}").status_code == 204
    assert gestao.get(f"/api/usuarios/{OPERACIONAL}").json()["ativo"] is False
    corpo = {"email": "carlos@ferrovia.com", "senha": SENHA}
    assert client.post("/api/auth/login", json=corpo).status_code == 403


def test_reativar_pelo_patch(gestao):
    gestao.delete(f"/api/usuarios/{OPERACIONAL}")

    assert gestao.patch(f"/api/usuarios/{OPERACIONAL}", json={"ativo": True}).json()["ativo"]


def test_desativar_inexistente_e_404(gestao):
    assert gestao.delete("/api/usuarios/999").status_code == 404


def test_lista_cargos_pro_formulario(gestao):
    resposta = gestao.get("/api/cargos")

    assert resposta.status_code == 200
    assert {"id": 5, "nome": "maquinista", "papel": "operacional"} in resposta.json()
