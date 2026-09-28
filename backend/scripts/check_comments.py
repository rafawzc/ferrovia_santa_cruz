import sys
import tokenize
from pathlib import Path

PASTAS_PADRAO = ("app", "tests", "scripts")
PRAGMAS = ("noqa", "type: ignore", "pragma")


def linhas_com_comentario(arquivo):
    with tokenize.open(arquivo) as fonte:
        for token in tokenize.generate_tokens(fonte.readline):
            if token.type != tokenize.COMMENT:
                continue
            linha = token.start[0]
            shebang = linha == 1 and token.string.startswith("#!")
            pragma_de_ferramenta = any(pragma in token.string for pragma in PRAGMAS)
            if shebang or pragma_de_ferramenta:
                continue
            yield linha


def violacoes(paths):
    return (
        f"{arquivo}:{linha}"
        for raiz in map(Path, paths)
        for arquivo in sorted(raiz.rglob("*.py"))
        if ".venv" not in arquivo.parts
        for linha in linhas_com_comentario(arquivo)
    )


def main(paths):
    encontradas = list(violacoes(paths))
    print(*encontradas, sep="\n")
    return 1 if encontradas else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:] or PASTAS_PADRAO))
