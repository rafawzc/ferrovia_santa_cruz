import pytest

from app.db import BancoIndisponivel, _pool, cursor


def test_cursor_com_host_inalcancavel_vira_banco_indisponivel(monkeypatch):
    monkeypatch.setenv("DB_HOST", "banco.invalid")
    _pool.cache_clear()

    with pytest.raises(BancoIndisponivel), cursor():
        pass

    _pool.cache_clear()
