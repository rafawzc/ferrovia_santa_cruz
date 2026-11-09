#!/usr/bin/env python3
import sys

if sys.version_info < (3, 10):
    print("O fsc precisa de Python 3.10 ou mais novo. Instale em https://www.python.org/downloads/")
    sys.exit(1)

import os
import shutil
import socket
import subprocess
import tempfile
import time

os.chdir(os.path.dirname(os.path.realpath(__file__)))
sys.stdout.reconfigure(errors="replace")
sys.stderr.reconfigure(errors="replace")

COMPOSE = ["docker", "compose"]
PORTA_FRONTEND_PADRAO = 5173
PORTAS_TENTADAS = 20
QUADROS_ESPERA = "|/-\\"
OPCOES_VERBOSO = ("-v", "--verboso")
COMANDOS_DE_SAIDA_INTEIRA = ("logs", "sh", "db", "ps", "test", "npm", "ui", "sim")

ambiente = dict(os.environ)
if hasattr(os, "getuid"):
    ambiente["HOST_UID"] = str(os.getuid())
    ambiente["HOST_GID"] = str(os.getgid())

verboso = False


def sair(mensagem, codigo=1):
    print(mensagem, file=sys.stderr)
    sys.exit(codigo)


def rodar(comando):
    codigo = subprocess.run(comando, env=ambiente).returncode
    if codigo != 0:
        sys.exit(codigo)


def formatar_tempo(segundos):
    minutos, resto = divmod(int(segundos), 60)
    return f"{minutos}m{resto:02d}s" if minutos else f"{resto}s"


def rodar_passo(titulo, comando):
    if verboso:
        print(f"==> {titulo}", flush=True)
        rodar(comando)
        return
    interativo = sys.stdout.isatty()
    inicio = time.monotonic()
    with tempfile.TemporaryFile() as captura:
        processo = subprocess.Popen(
            comando, env=ambiente, stdin=subprocess.DEVNULL, stdout=captura, stderr=subprocess.STDOUT
        )
        quadro = 0
        while True:
            try:
                processo.wait(timeout=0.1)
                break
            except subprocess.TimeoutExpired:
                if interativo:
                    tempo = formatar_tempo(time.monotonic() - inicio)
                    print(f"\r{titulo} ... {QUADROS_ESPERA[quadro % 4]} {tempo}", end="", flush=True)
                    quadro += 1
        captura.seek(0)
        saida = captura.read().decode("utf-8", errors="replace")
    prefixo = "\r" if interativo else ""
    if processo.returncode == 0:
        print(f"{prefixo}{titulo} ... ok ({formatar_tempo(time.monotonic() - inicio)})".ljust(79))
        return
    print(f"{prefixo}{titulo} ... falhou".ljust(79))
    print(saida, end="" if saida.endswith("\n") else "\n")
    sys.exit(processo.returncode)


def no_frontend(*argumentos):
    return [*COMPOSE, "run", "--rm", "--no-deps", "frontend", *argumentos]


def no_backend(*argumentos):
    return [*COMPOSE, "run", "--rm", "--no-deps", "backend", *argumentos]


def garantir_arquivo_env():
    if not os.path.isfile(".env"):
        shutil.copyfile(".env.example", ".env")
        print("Criado .env a partir de .env.example")


def garantir_dependencias_frontend():
    if not os.path.isdir("frontend/node_modules"):
        rodar_passo(
            "Instalando as dependências do frontend",
            no_frontend("npm", "install", "--no-audit", "--no-fund"),
        )


def preflight(comando):
    com_interface = sys.platform in ("win32", "darwin")
    if shutil.which("docker") is None:
        instalar = "o Docker Desktop (https://www.docker.com/products/docker-desktop/)" if com_interface else "o Docker Engine (https://docs.docker.com/engine/install/)"
        sair(f"Docker não instalado. Instale {instalar} e rode de novo.")
    info = subprocess.run(["docker", "info"], capture_output=True, encoding="utf-8", errors="replace")
    if info.returncode != 0:
        if "permission denied" in info.stderr.lower():
            sair("Sem permissão para usar o Docker. No Linux: sudo usermod -aG docker $USER e entre de novo na sessão.")
        religar = "Abra o Docker Desktop e espere ele iniciar." if com_interface else "Inicie o serviço: sudo systemctl start docker."
        sair(f"Docker não está rodando. {religar}")
    if subprocess.run([*COMPOSE, "version"], capture_output=True).returncode != 0:
        sair("Docker Compose não encontrado. Instale o plugin 'docker compose' (https://docs.docker.com/compose/install/).")


def porta_livre(porta):
    for familia, endereco in ((socket.AF_INET, "0.0.0.0"), (socket.AF_INET6, "::")):
        try:
            teste = socket.socket(familia, socket.SOCK_STREAM)
        except OSError:
            continue
        with teste:
            if hasattr(socket, "SO_EXCLUSIVEADDRUSE"):
                teste.setsockopt(socket.SOL_SOCKET, socket.SO_EXCLUSIVEADDRUSE, 1)
            try:
                teste.bind((endereco, porta))
            except OSError:
                return False
    return True


def saida_do_compose(*argumentos):
    resultado = subprocess.run(
        [*COMPOSE, *argumentos], env=ambiente, capture_output=True, encoding="utf-8", errors="replace"
    )
    return resultado.stdout if resultado.returncode == 0 else ""


def porta_publicada_pelo_frontend():
    if "frontend" not in saida_do_compose("ps", "--status", "running", "--services").split():
        return None
    endereco = saida_do_compose("port", "frontend", "5173").strip()
    return int(endereco.rsplit(":", 1)[1]) if endereco else None


def gravar_porta_no_env(porta):
    ambiente["PORTA_FRONTEND"] = str(porta)
    with open(".env", encoding="utf-8") as arquivo:
        atual = arquivo.read()
    if f"PORTA_FRONTEND={porta}" in atual.splitlines():
        return
    linhas = [linha for linha in atual.splitlines() if not linha.startswith("PORTA_FRONTEND=")]
    linhas.append(f"PORTA_FRONTEND={porta}")
    rascunho = ".env.novo"
    with open(rascunho, "w", encoding="utf-8") as arquivo:
        arquivo.write("\n".join(linhas) + "\n")
    os.replace(rascunho, ".env")


def escolher_porta_frontend():
    porta = porta_publicada_pelo_frontend()
    if porta is None:
        faixa = range(PORTA_FRONTEND_PADRAO, PORTA_FRONTEND_PADRAO + PORTAS_TENTADAS)
        porta = next((candidata for candidata in faixa if porta_livre(candidata)), None)
        if porta is None:
            sair(f"Nenhuma porta livre entre {faixa.start} e {faixa.stop - 1}. Feche algum programa e rode de novo.")
        if porta != PORTA_FRONTEND_PADRAO:
            print(f"A porta {PORTA_FRONTEND_PADRAO} está ocupada por outro programa; usando a {porta}.")
    gravar_porta_no_env(porta)
    return porta


def subir(argumentos):
    porta = escolher_porta_frontend()
    rodar_passo("Construindo e subindo os containers", [*COMPOSE, "up", "-d", "--build"])
    print(f"http://localhost:{porta}")


def parar(argumentos):
    rodar_passo("Parando os containers", [*COMPOSE, "down"])


def reiniciar(argumentos):
    rodar_passo("Reiniciando os containers", [*COMPOSE, "restart", *argumentos])


def acompanhar_logs(argumentos):
    rodar([*COMPOSE, "logs", "-f", *argumentos])


def listar(argumentos):
    rodar([*COMPOSE, "ps"])


def construir(argumentos):
    rodar_passo("Construindo as imagens", [*COMPOSE, "build"])


def abrir_shell(argumentos):
    if not argumentos:
        sair("uso: python3 fsc.py sh <serviço>")
    rodar([*COMPOSE, "exec", argumentos[0], "sh", "-c", "if command -v bash >/dev/null 2>&1; then exec bash; else exec sh; fi"])


def testar(argumentos):
    rodar(no_backend("pytest", *argumentos))


def verificar_frontend():
    garantir_dependencias_frontend()
    rodar_passo("Lint do frontend", no_frontend("npm", "run", "lint"))


def verificar_backend():
    rodar_passo("Lint do backend (ruff)", no_backend("ruff", "check", "."))
    rodar_passo("Lint do backend (comentários)", no_backend("python", "scripts/check_comments.py"))


def verificar_estilo(argumentos):
    alvo = argumentos[0] if argumentos else "todos"
    if alvo not in ("fe", "be", "todos"):
        sair(f"lint: esperado fe ou be, recebi '{alvo}'")
    if alvo in ("fe", "todos"):
        verificar_frontend()
    if alvo in ("be", "todos"):
        verificar_backend()


def formatar(argumentos):
    garantir_dependencias_frontend()
    rodar_passo("Formatando o frontend", no_frontend("npm", "run", "format"))
    rodar_passo("Formatando o backend", no_backend("ruff", "format", "."))


def checar_tipos(argumentos):
    garantir_dependencias_frontend()
    rodar_passo("Checagem de tipos do frontend", no_frontend("npm", "run", "typecheck"))


def conferir_tudo(argumentos):
    verificar_frontend()
    verificar_backend()
    rodar_passo("Checagem de tipos do frontend", no_frontend("npm", "run", "typecheck"))
    rodar_passo("Formato do frontend", no_frontend("npm", "run", "format:check"))
    rodar_passo("Formato do backend", no_backend("ruff", "format", "--check", "."))
    rodar_passo("Testes do backend", no_backend("pytest"))
    rodar_passo("Build do frontend", no_frontend("npm", "run", "build"))
    print("check passou")


def abrir_banco(argumentos):
    rodar([*COMPOSE, "exec", "db", "sh", "-c", 'exec mysql -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE"'])


def nome_do_volume_do_banco():
    configuracao = subprocess.run(
        [*COMPOSE, "config"], env=ambiente, capture_output=True, encoding="utf-8", errors="replace", check=True
    )
    projeto = next(linha[len("name: "):] for linha in configuracao.stdout.splitlines() if linha.startswith("name: "))
    return f"{projeto}_db_data"


def recriar_banco(argumentos):
    volume = nome_do_volume_do_banco()
    if "--yes" not in argumentos:
        print("Isto DESTRÓI o banco de desenvolvimento:")
        print("  - remove o container do banco")
        print(f"  - apaga o volume docker '{volume}' (todos os dados do MySQL)")
        print("  - recria o banco a partir de db/script.sql")
        if input("Digite 'reset' para confirmar: ") != "reset":
            sair("Cancelado.")
    rodar_passo("Removendo o container do banco", [*COMPOSE, "rm", "--stop", "--force", "db"])
    if subprocess.run(["docker", "volume", "inspect", volume], capture_output=True).returncode == 0:
        rodar_passo("Apagando o volume do banco", ["docker", "volume", "rm", volume])
    rodar_passo("Recriando o banco", [*COMPOSE, "up", "-d", "--wait", "db"])


def rodar_npm(argumentos):
    rodar(no_frontend("npm", *argumentos))


def adicionar_componentes(argumentos):
    if argumentos[:1] != ["add"] or len(argumentos) < 2:
        sair("uso: python3 fsc.py ui add <componentes...>")
    garantir_dependencias_frontend()
    rodar(no_frontend("npx", "shadcn@latest", "add", *argumentos[1:]))
    rodar(no_frontend("npx", "eslint", "--fix", "src/components/ui"))


def simular(argumentos):
    rodar(no_backend("python", "scripts/simulador.py", *argumentos))


def mostrar_ajuda(argumentos):
    print("Uso: python3 fsc.py [-v] <comando> [argumentos]   (no Windows: python fsc.py ...)")
    print("  -v, --verboso       mostra a saída completa em vez de só o resultado de cada passo")
    grupo_atual = None
    for nome, (grupo, uso, descricao, _) in comandos.items():
        if grupo != grupo_atual:
            print(f"\n{grupo}")
            grupo_atual = grupo
        print(f"  {uso:<20}{descricao}")
    print(f"\n  {'help':<20}mostra esta mensagem")


comandos = {
    "up": ("Stack", "up", "constrói e sobe tudo (em segundo plano)", subir),
    "down": ("Stack", "down", "para e remove os containers", parar),
    "restart": ("Stack", "restart [serviço]", "reinicia todos os serviços ou um", reiniciar),
    "logs": ("Stack", "logs [serviço]", "acompanha os logs de todos os serviços ou de um", acompanhar_logs),
    "ps": ("Stack", "ps", "lista os serviços", listar),
    "build": ("Stack", "build", "constrói as imagens", construir),
    "sh": ("Stack", "sh <serviço>", "abre um shell dentro de um serviço rodando", abrir_shell),
    "test": ("Qualidade", "test [args]", "pytest do backend (args repassados)", testar),
    "lint": ("Qualidade", "lint [fe|be]", "lint do frontend, do backend ou dos dois (padrão)", verificar_estilo),
    "fmt": ("Qualidade", "fmt", "formata frontend e backend", formatar),
    "typecheck": ("Qualidade", "typecheck", "checagem de tipos do frontend", checar_tipos),
    "check": ("Qualidade", "check", "lint + tipos + formato + testes + build do frontend", conferir_tudo),
    "db": ("Banco", "db", "shell do mysql com as credenciais do .env", abrir_banco),
    "db:reset": ("Banco", "db:reset [--yes]", "DESTRÓI os dados de dev e recria o banco de db/script.sql", recriar_banco),
    "npm": ("Frontend", "npm <args>", "roda o npm num container descartável do frontend", rodar_npm),
    "ui": ("Frontend", "ui add <comps...>", "adiciona componentes shadcn e corrige o lint deles", adicionar_componentes),
    "sim": ("IoT", "sim [args]", "envia leituras simuladas de sensor (precisa do up antes)", simular),
}


def principal():
    global verboso
    argumentos = sys.argv[1:]
    nome = next((argumento for argumento in argumentos if argumento not in OPCOES_VERBOSO), "help")
    if nome in COMANDOS_DE_SAIDA_INTEIRA:
        argumentos = argumentos[argumentos.index(nome):]
    else:
        verboso = any(argumento in OPCOES_VERBOSO for argumento in argumentos)
        argumentos = [argumento for argumento in argumentos if argumento not in OPCOES_VERBOSO]
    if nome in ("help", "-h", "--help"):
        mostrar_ajuda([])
        return
    if nome not in comandos:
        mostrar_ajuda([])
        sys.exit(1)
    garantir_arquivo_env()
    preflight(nome)
    comandos[nome][3](argumentos[1:])


try:
    principal()
except KeyboardInterrupt:
    print("\nInterrompido.")
    sys.exit(130)
