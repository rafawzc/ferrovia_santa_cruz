# scripts/ — utilitários de host

Scripts que rodam **no host**, fora dos containers — exceção consciente ao "tudo no Docker", porque servem justamente pra investigar a máquina antes de haver Docker. Operação normal do projeto continua pelo `fsc.py`.

## `diagnostico-windows.ps1`

Diagnóstico somente-leitura do PC Windows: hardware, programas e versões mínimas, portas, viabilidade de Docker e os ajustes que o projeto exigiria pra rodar nativo. Documentação de uso e tabela do que ele checa: [`docs/arquitetura/sem-docker.md`](../docs/arquitetura/sem-docker.md).

Quirks:

- **PowerShell 5.1** é o alvo (o Windows limpo não tem o 7). Nada de `??`, `?:` nem `Get-CimInstance -CimSession` moderno.
- Sem acento e sem emoji na saída: o console do Windows em `cp850`/`cp437` imprime lixo.
- `$ErrorActionPreference = 'SilentlyContinue'` é proposital — num PC pelado metade das consultas falha, e o script tem que seguir e imprimir o resto.
- Os mínimos de versão não são chute: saem de `backend/pyproject.toml` (Python 3.13), `docker-compose.yml` (MySQL 8.4, Node 24) e da exigência do Vite 7 (Node 22.12+). Mudou lá, mude aqui.
- Zero comentário no `.ps1`, igual ao resto do repo. O *porquê* mora aqui.

## `diagnostico-windows-oneliner.txt`

O mesmo script embutido em base64, numa linha, pra PC sem o repositório. É **gerado** — depois de editar o `.ps1`, regere:

```bash
python3 -c "import base64,pathlib; t=pathlib.Path('scripts/diagnostico-windows.ps1').read_text(); b=base64.b64encode(t.encode()).decode(); pathlib.Path('scripts/diagnostico-windows-oneliner.txt').write_text('powershell -NoProfile -ExecutionPolicy Bypass -Command \"iex ([Text.Encoding]::UTF8.GetString([Convert]::FromBase64String(\'' + b + '\')))\"' + chr(10))"
```

Passa de 10 mil caracteres. Console do Windows corta colagem perto de 8192 — por isso a forma com o repositório clonado é a recomendada, e esta é o plano B.
