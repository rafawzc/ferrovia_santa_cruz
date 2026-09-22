import subprocess
import sys
from pathlib import Path

SCRIPT = Path(__file__).parent.parent / "scripts" / "check_comments.py"


def rodar(*paths):
    return subprocess.run(
        [sys.executable, str(SCRIPT), *map(str, paths)], capture_output=True, text=True
    )


def test_falha_apontando_arquivo_e_linha_do_comentario(tmp_path):
    arquivo = tmp_path / "modulo.py"
    arquivo.write_text("x = 1\ny = 2  # explica\n")

    resultado = rodar(tmp_path)

    assert resultado.returncode == 1
    assert f"{arquivo}:2" in resultado.stdout


def test_aceita_shebang_e_pragmas_de_ferramenta(tmp_path):
    (tmp_path / "ok.py").write_text(
        "#!/usr/bin/env python\n"
        "import os  # noqa: F401\n"
        'x: int = "a"  # type: ignore\n'
        "if x:  # pragma: no cover\n"
        "    pass\n"
    )

    resultado = rodar(tmp_path)

    assert resultado.returncode == 0, resultado.stdout


def test_shebang_fora_da_linha_1_e_comentario(tmp_path):
    (tmp_path / "ruim.py").write_text("x = 1\n#!/usr/bin/env python\n")

    assert rodar(tmp_path).returncode == 1


def test_sem_argumentos_varre_app_tests_scripts_e_ignora_venv(tmp_path):
    for pasta in ("app", "tests", "scripts", "outra", ".venv"):
        (tmp_path / pasta).mkdir()
        (tmp_path / pasta / "m.py").write_text("x = 1  # comentario\n")

    resultado = subprocess.run(
        [sys.executable, str(SCRIPT)], cwd=tmp_path, capture_output=True, text=True
    )

    assert resultado.stdout.split() == ["app/m.py:1", "tests/m.py:1", "scripts/m.py:1"]


def test_ignora_venv_dentro_do_caminho_passado(tmp_path):
    (tmp_path / ".venv" / "lib").mkdir(parents=True)
    (tmp_path / ".venv" / "lib" / "dep.py").write_text("x = 1  # de terceiro\n")

    assert rodar(tmp_path).returncode == 0
