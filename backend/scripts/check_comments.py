import sys
import tokenize
from pathlib import Path

PADRAO = ("app", "tests", "scripts")
PRAGMAS = ("noqa", "type: ignore", "pragma")


def comentarios(arquivo):
    with tokenize.open(arquivo) as fonte:
        for token in tokenize.generate_tokens(fonte.readline):
            linha = token.start[0]
            if token.type != tokenize.COMMENT:
                continue
            if linha == 1 and token.string.startswith("#!"):
                continue
            if any(pragma in token.string for pragma in PRAGMAS):
                continue
            yield linha


def main(paths):
    violacoes = [
        f"{arquivo}:{linha}"
        for raiz in map(Path, paths)
        for arquivo in sorted(raiz.rglob("*.py"))
        if ".venv" not in arquivo.parts
        for linha in comentarios(arquivo)
    ]
    print(*violacoes, sep="\n")
    return 1 if violacoes else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or PADRAO))
