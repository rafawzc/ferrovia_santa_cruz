from datetime import timedelta

from app.core.security import criar_token, hash_senha, ler_token, verificar_senha


def test_hash_confere_so_com_a_senha_certa():
    hash_ = hash_senha("ferrovia123")

    assert hash_ != "ferrovia123"
    assert verificar_senha("ferrovia123", hash_)
    assert not verificar_senha("outra-senha", hash_)


def test_token_devolve_o_id_do_usuario():
    assert ler_token(criar_token(7, "gestao")) == 7


def test_token_expirado_ou_adulterado_nao_vale():
    assert ler_token(criar_token(7, "gestao", validade=timedelta(seconds=-1))) is None
    assert ler_token(criar_token(7, "gestao") + "x") is None
    assert ler_token("lixo") is None
