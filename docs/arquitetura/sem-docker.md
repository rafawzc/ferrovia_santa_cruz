# Rodar sem Docker — diagnóstico da máquina

O jeito oficial de rodar o projeto é Docker Compose pelo `fsc.py` ([`operacao.md`](operacao.md)). Em máquina fraca ou sem Docker Desktop, antes de tentar qualquer coisa, rode o diagnóstico: ele diz o que a máquina tem, o que falta, o que dá pra instalar e o que o próprio projeto precisaria mudar.

## Como rodar

Com o repositório já clonado, no PowerShell, dentro da pasta do projeto:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\diagnostico-windows.ps1
```

Em PC sem o repositório, existe a versão autocontida em [`scripts/diagnostico-windows-oneliner.txt`](../../scripts/diagnostico-windows-oneliner.txt): uma linha só, que carrega o script embutido em base64 e não baixa nada. Cole no **PowerShell** (não no Prompt de Comando). São ~10 mil caracteres: alguns consoles cortam colagem acima de 8192, e aí a linha falha no meio — se isso acontecer, use a forma com o repositório clonado.

Nada é instalado nem alterado: o script só lê e imprime.

## O que ele checa

| Bloco | Conteúdo |
|-------|----------|
| Máquina | versão e build do Windows, arquitetura, PowerShell, CPU/threads, RAM (mínimo 4 GB, confortável 8), disco livre no drive do sistema (~6 GB), se a sessão é administrador, se caminhos longos estão habilitados (`node_modules` estoura 260 caracteres) |
| Obrigatórios | Node.js ≥ 22.12, npm ≥ 10, Python ≥ 3.13, MySQL Server ≥ 8.0 — versão instalada × mínimo exigido |
| Opcionais | `uv` ≥ 0.9 (o backend usa no container), Git ≥ 2.40 |
| Instalação | se o `winget` existe e a linha de `winget install` de cada item pendente |
| Portas | `5173` (Vite), `8000` (FastAPI), `3306` (MySQL) livres ou ocupadas |
| Docker | se o Docker está instalado e se a virtualização/Hyper-V está ativa (sem ela o Docker Desktop não sobe) |
| Ajustes no projeto | o que precisaria mudar no código pra rodar fora dos containers (abaixo) |
| Veredito | lista só o que **impede** rodar agora, e manda rodar de novo depois de resolver |

Os mínimos vêm do que o projeto já declara: `requires-python >= 3.13` no `backend/pyproject.toml`, `mysql:8.4` e `node:24-slim` no `docker-compose.yml`, Vite 7 (pede Node 20.19+/22.12+).

## O que o projeto exige pra rodar fora dos containers

O diagnóstico imprime esta lista porque ela é a parte que nenhum instalador resolve. Hoje o projeto **não** tem caminho nativo pronto:

1. `frontend/vite.config.ts` faz proxy de `/api` pra `http://backend:8000` — nome de serviço do Compose, que não existe fora da rede do Docker. Teria que virar `http://127.0.0.1:8000`.
2. O backend recebe `DB_HOST: db` do Compose; nativo teria que ser `127.0.0.1`.
3. O banco nasce do `db/script.sql` porque o container do MySQL roda o que está em `docker-entrypoint-initdb.d`. Nativo é na mão: `mysql -u root -p < db/script.sql`.
4. O `fsc.py` só fala com Docker — todos os comandos são `docker compose`. Sem containers, cada serviço sobe a mão (`uvicorn app.main:app --reload` no backend, `npm run dev` no frontend).

Enquanto esses quatro pontos não forem tratados, o resultado verde do diagnóstico significa "a máquina aguenta", não "é só rodar".
