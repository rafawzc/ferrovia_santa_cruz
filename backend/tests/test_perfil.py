import pytest

from tests.fakes import CLIENTE, SENHA


def test_edita_o_proprio_perfil_e_devolve_o_mesmo_formato_do_me(como):
    client = como(CLIENTE)

    resposta = client.patch("/api/auth/me", json={"nome": "Novo Nome", "telefone": "47999990000"})

    assert resposta.status_code == 200
    assert resposta.json() == client.get("/api/auth/me").json()
    assert resposta.json()["nome"] == "Novo Nome"
    assert resposta.json()["telefone"] == "47999990000"
    assert resposta.json()["papel"] == "cliente"


def test_sem_sessao_e_401(client):
    assert client.patch("/api/auth/me", json={"nome": "X"}).status_code == 401


@pytest.mark.parametrize("campo", [{"cargo_id": 2}, {"ativo": False}])
def test_nao_deixa_mexer_em_cargo_nem_ativo(como, usuarios, campo):
    resposta = como(CLIENTE).patch("/api/auth/me", json=campo)

    assert resposta.status_code == 422
    assert usuarios.dados[CLIENTE]["cargo_id"] == 1
    assert usuarios.dados[CLIENTE]["ativo"] is True


@pytest.mark.parametrize("senha_atual", [None, "errada123"])
def test_trocar_senha_exige_senha_atual_correta(como, usuarios, senha_atual):
    hash_antes = usuarios.dados[CLIENTE]["senha_hash"]
    corpo = {"senha": "novasenha1", "senha_atual": senha_atual}

    resposta = como(CLIENTE).patch("/api/auth/me", json=corpo)

    assert resposta.status_code == 400
    assert resposta.json() == {"detail": "Senha atual incorreta"}
    assert usuarios.dados[CLIENTE]["senha_hash"] == hash_antes


def test_email_de_outro_usuario_e_409(como):
    resposta = como(CLIENTE).patch("/api/auth/me", json={"email": "ana@ferrovia.com"})

    assert resposta.status_code == 409


def test_troca_de_senha_vale_no_login(como):
    client = como(CLIENTE)

    resposta = client.patch("/api/auth/me", json={"senha": "novasenha1", "senha_atual": SENHA})
    velha = client.post("/api/auth/login", json={"email": "cliente@email.com", "senha": SENHA})
    nova = client.post(
        "/api/auth/login", json={"email": "cliente@email.com", "senha": "novasenha1"}
    )

    assert resposta.status_code == 200
    assert velha.status_code == 401
    assert nova.status_code == 200
