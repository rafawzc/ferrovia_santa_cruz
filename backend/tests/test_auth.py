from tests.fakes import GESTAO, INATIVO, SENHA, indisponivel


def login(client, email="ana@ferrovia.com", senha=SENHA):
    return client.post("/api/auth/login", json={"email": email, "senha": senha})


def test_login_seta_cookie_httponly_e_devolve_o_usuario(client):
    resposta = login(client)

    assert resposta.status_code == 200
    assert resposta.json() == {
        "id": GESTAO,
        "nome": "Ana Gestora",
        "email": "ana@ferrovia.com",
        "telefone": None,
        "foto_url": None,
        "cargo": "admin",
        "papel": "gestao",
        "ativo": True,
    }
    cookie = resposta.headers["set-cookie"]
    assert cookie.startswith("sessao=")
    for atributo in ("HttpOnly", "SameSite=lax", "Path=/", "Max-Age=28800"):
        assert atributo in cookie
    assert "Secure" not in cookie


def test_login_com_senha_errada_ou_email_desconhecido_e_401_generico(client):
    senha_errada = login(client, senha="errada123")
    email_desconhecido = login(client, email="ninguem@ferrovia.com")

    assert senha_errada.status_code == email_desconhecido.status_code == 401
    assert senha_errada.json() == email_desconhecido.json() == {"detail": "Credenciais inválidas"}
    assert "set-cookie" not in senha_errada.headers


def test_login_de_usuario_desativado_e_403(client):
    resposta = login(client, email="ex@ferrovia.com")

    assert resposta.status_code == 403
    assert resposta.json() == {"detail": "Usuário desativado"}


def test_login_sem_senha_e_422(client):
    assert client.post("/api/auth/login", json={"email": "ana@ferrovia.com"}).status_code == 422


def test_me_usa_o_cookie_do_login(client):
    login(client)

    resposta = client.get("/api/auth/me")

    assert resposta.status_code == 200
    assert resposta.json()["id"] == GESTAO


def test_me_sem_cookie_ou_com_cookie_invalido_e_401(client):
    assert client.get("/api/auth/me").status_code == 401

    client.cookies.set("sessao", "lixo")

    assert client.get("/api/auth/me").status_code == 401


def test_me_de_usuario_desativado_depois_do_login_e_401(como):
    assert como(INATIVO).get("/api/auth/me").status_code == 401


def test_logout_apaga_o_cookie(client):
    login(client)

    resposta = client.post("/api/auth/logout")

    assert resposta.status_code == 204
    assert 'sessao=""' in resposta.headers["set-cookie"]
    assert client.get("/api/auth/me").status_code == 401


def test_cadastro_cria_cliente_com_cargo_padrao_e_permite_login(client):
    corpo = {"nome": "Nova Pessoa", "email": "nova@email.com", "senha": "senhaforte"}

    resposta = client.post("/api/auth/cadastro", json=corpo)

    assert resposta.status_code == 201
    assert resposta.json()["cargo"] == "comum"
    assert resposta.json()["papel"] == "cliente"
    assert "set-cookie" not in resposta.headers
    assert login(client, "nova@email.com", "senhaforte").status_code == 200


def test_cadastro_ignora_tentativa_de_escolher_cargo(client):
    corpo = {"nome": "Esperto", "email": "esperto@email.com", "senha": "senhaforte", "cargo_id": 2}

    assert client.post("/api/auth/cadastro", json=corpo).json()["papel"] == "cliente"


def test_cadastro_com_senha_curta_ou_email_invalido_e_422(client):
    curta = {"nome": "X", "email": "x@email.com", "senha": "1234567"}
    email_ruim = {"nome": "X", "email": "sem-arroba", "senha": "senhaforte"}

    assert client.post("/api/auth/cadastro", json=curta).status_code == 422
    assert client.post("/api/auth/cadastro", json=email_ruim).status_code == 422


def test_cadastro_com_email_repetido_e_409(client):
    corpo = {"nome": "Outra Ana", "email": "ana@ferrovia.com", "senha": "senhaforte"}

    resposta = client.post("/api/auth/cadastro", json=corpo)

    assert resposta.status_code == 409
    assert resposta.json() == {"detail": "Registro duplicado"}


def test_login_com_o_banco_fora_do_ar_e_503(client, usuarios):
    def cai(email):
        raise indisponivel()

    usuarios.por_email = cai

    resposta = login(client)

    assert resposta.status_code == 503
    assert resposta.json() == {"detail": "Banco de dados indisponível"}


def test_recuperar_senha_responde_202_sem_revelar_se_o_email_existe(client):
    existe = client.post("/api/auth/recuperar-senha", json={"email": "ana@ferrovia.com"})
    nao_existe = client.post("/api/auth/recuperar-senha", json={"email": "nao@existe.com"})

    assert existe.status_code == nao_existe.status_code == 202
    assert existe.json() == nao_existe.json()
