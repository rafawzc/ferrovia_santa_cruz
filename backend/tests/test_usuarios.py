import pytest

from tests.fakes import (
    ID_CLIENTE,
    ID_GESTAO,
    ID_GESTAO_SUPLENTE,
    ID_OPERACIONAL,
    SENHA,
)

AUTO_DESATIVACAO = {"detail": "Você não pode desativar a própria conta"}
ULTIMO_ADMINISTRADOR = {"detail": "O sistema precisa de pelo menos um administrador ativo"}

NOVO = {
    "nome": "Sergio Santana",
    "email": "sergio@ferrovia.com",
    "senha": "senhaforte",
    "cargo_id": 5,
    "telefone": "47999990009",
}


@pytest.fixture
def gestao(como):
    return como(ID_GESTAO)


def test_gestao_lista_usuarios_sem_expor_hash(gestao):
    resposta = gestao.get("/api/usuarios")

    assert resposta.status_code == 200
    assert [u["email"] for u in resposta.json()][:2] == ["ana@ferrovia.com", "carlos@ferrovia.com"]
    assert all("senha_hash" not in u for u in resposta.json())


@pytest.mark.parametrize("usuario_id", [ID_OPERACIONAL, ID_CLIENTE])
def test_quem_nao_e_gestao_leva_403(como, usuario_id):
    nao_gestao = como(usuario_id)

    assert nao_gestao.get("/api/usuarios").status_code == 403
    assert nao_gestao.post("/api/usuarios", json=NOVO).status_code == 403
    assert nao_gestao.get("/api/cargos").status_code == 403


def test_sem_cookie_leva_401(client):
    assert client.get("/api/usuarios").status_code == 401


def test_detalhe_devolve_o_usuario(gestao):
    assert gestao.get(f"/api/usuarios/{ID_OPERACIONAL}").json()["nome"] == "Carlos Souza"


def test_detalhe_e_404_quando_nao_existe(gestao):
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
        f"/api/usuarios/{ID_OPERACIONAL}", json={"telefone": "4733330000", "senha": "novasenha1"}
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
    repetido = gestao.patch(f"/api/usuarios/{ID_OPERACIONAL}", json={"email": "ana@ferrovia.com"})
    assert repetido.status_code == 409


def test_desativar_bloqueia_o_login(gestao, client):
    assert gestao.delete(f"/api/usuarios/{ID_OPERACIONAL}").status_code == 204
    assert gestao.get(f"/api/usuarios/{ID_OPERACIONAL}").json()["ativo"] is False
    corpo = {"email": "carlos@ferrovia.com", "senha": SENHA}
    assert client.post("/api/auth/login", json=corpo).status_code == 403


def test_reativar_pelo_patch(gestao):
    gestao.delete(f"/api/usuarios/{ID_OPERACIONAL}")

    assert gestao.patch(f"/api/usuarios/{ID_OPERACIONAL}", json={"ativo": True}).json()["ativo"]


def test_desativar_inexistente_e_404(gestao):
    assert gestao.delete("/api/usuarios/999").status_code == 404


def test_nao_desativa_a_propria_conta_pelo_delete(gestao, usuarios):
    resposta = gestao.delete(f"/api/usuarios/{ID_GESTAO}")

    assert resposta.status_code == 403
    assert resposta.json() == AUTO_DESATIVACAO
    assert usuarios.dados[ID_GESTAO]["ativo"] is True


def test_nao_desativa_a_propria_conta_pelo_patch(gestao, usuarios):
    resposta = gestao.patch(f"/api/usuarios/{ID_GESTAO}", json={"ativo": False})

    assert resposta.status_code == 403
    assert resposta.json() == AUTO_DESATIVACAO
    assert usuarios.dados[ID_GESTAO]["ativo"] is True


def test_nao_desativa_o_ultimo_administrador_ativo_pelo_delete(gestao, usuarios):
    usuarios.desativar(ID_GESTAO_SUPLENTE)

    resposta = gestao.delete(f"/api/usuarios/{ID_GESTAO}")

    assert resposta.status_code == 409
    assert resposta.json() == ULTIMO_ADMINISTRADOR
    assert usuarios.dados[ID_GESTAO]["ativo"] is True


def test_nao_desativa_o_ultimo_administrador_ativo_pelo_patch(gestao, usuarios):
    usuarios.desativar(ID_GESTAO_SUPLENTE)

    resposta = gestao.patch(f"/api/usuarios/{ID_GESTAO}", json={"ativo": False})

    assert resposta.status_code == 409
    assert resposta.json() == ULTIMO_ADMINISTRADOR
    assert usuarios.dados[ID_GESTAO]["ativo"] is True


def test_nao_troca_o_cargo_do_ultimo_administrador_ativo(gestao, usuarios):
    usuarios.desativar(ID_GESTAO_SUPLENTE)

    resposta = gestao.patch(f"/api/usuarios/{ID_GESTAO}", json={"cargo_id": 5})

    assert resposta.status_code == 409
    assert resposta.json() == ULTIMO_ADMINISTRADOR
    assert usuarios.dados[ID_GESTAO]["cargo_id"] == 2


def test_troca_o_cargo_de_administrador_quando_ha_outro_ativo(gestao, usuarios):
    resposta = gestao.patch(f"/api/usuarios/{ID_GESTAO_SUPLENTE}", json={"cargo_id": 5})

    assert resposta.status_code == 200
    assert usuarios.dados[ID_GESTAO_SUPLENTE]["cargo_id"] == 5


def test_desativa_administrador_quando_ha_outro_ativo(gestao, usuarios):
    pelo_delete = gestao.delete(f"/api/usuarios/{ID_GESTAO_SUPLENTE}")

    assert pelo_delete.status_code == 204
    assert usuarios.dados[ID_GESTAO_SUPLENTE]["ativo"] is False

    pelo_patch = gestao.patch(f"/api/usuarios/{ID_GESTAO_SUPLENTE}", json={"ativo": True})

    assert pelo_patch.json()["ativo"] is True


def test_senha_temporaria_e_devolvida_uma_vez_e_grava_so_o_hash(gestao, usuarios, client):
    hash_antes = usuarios.dados[ID_OPERACIONAL]["senha_hash"]

    resposta = gestao.post(f"/api/usuarios/{ID_OPERACIONAL}/senha-temporaria")

    assert resposta.status_code == 200
    senha = resposta.json()["senha_temporaria"]
    assert list(resposta.json()) == ["senha_temporaria"]
    assert len(senha) == 12
    hash_depois = usuarios.dados[ID_OPERACIONAL]["senha_hash"]
    assert hash_depois != hash_antes
    assert senha not in hash_depois
    assert (
        client.post(
            "/api/auth/login", json={"email": "carlos@ferrovia.com", "senha": senha}
        ).status_code
        == 200
    )
    assert (
        client.post(
            "/api/auth/login", json={"email": "carlos@ferrovia.com", "senha": SENHA}
        ).status_code
        == 401
    )


def test_senha_temporaria_nova_invalida_a_anterior(gestao, client):
    rota = f"/api/usuarios/{ID_OPERACIONAL}/senha-temporaria"
    anterior = gestao.post(rota).json()["senha_temporaria"]

    atual = gestao.post(rota).json()["senha_temporaria"]

    assert atual != anterior
    corpo = {"email": "carlos@ferrovia.com", "senha": anterior}
    assert client.post("/api/auth/login", json=corpo).status_code == 401
    corpo["senha"] = atual
    assert client.post("/api/auth/login", json=corpo).status_code == 200


def test_senha_temporaria_de_usuario_inexistente_e_404(gestao):
    resposta = gestao.post("/api/usuarios/999/senha-temporaria")

    assert resposta.status_code == 404
    assert resposta.json() == {"detail": "Usuário não encontrado"}


@pytest.mark.parametrize("usuario_id", [ID_OPERACIONAL, ID_CLIENTE])
def test_senha_temporaria_so_pra_gestao(como, usuario_id):
    rota = f"/api/usuarios/{ID_GESTAO}/senha-temporaria"

    assert como(usuario_id).post(rota).status_code == 403


def test_senha_temporaria_sem_cookie_e_401(client):
    assert client.post(f"/api/usuarios/{ID_GESTAO}/senha-temporaria").status_code == 401


def test_lista_cargos_pro_formulario(gestao):
    resposta = gestao.get("/api/cargos")

    assert resposta.status_code == 200
    assert {"id": 5, "nome": "maquinista", "papel": "operacional"} in resposta.json()
