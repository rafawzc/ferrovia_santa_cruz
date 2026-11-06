# Como operar o projeto

> Tudo passa pelo `fsc.py`, na raiz do repo. Ele é a porta única: sobe a stack, roda lint/teste, abre o banco e roda npm — sempre dentro dos containers. É um script Python (só biblioteca padrão) que roda igual em Linux, macOS e Windows. `docker compose` direto só quando o `fsc.py` não tem o comando. Modelo dos containers: [`containers-e-rede.md`](containers-e-rede.md).

## Pré-requisitos

- Docker: Docker Desktop no Windows e no macOS; Docker Engine com o plugin Compose no Linux.
- Python 3.10+ no host, só para rodar o `fsc.py` (biblioteca padrão, nada para `pip install`). Abaixo disso o script avisa e sai.
- Porta `5173` livre.
- Nada mais. Não instale node nem python pro projeto em si: o Python do host serve só pra executar o `fsc.py`.

## Primeira vez

Linux e macOS:

```bash
git clone https://github.com/rafawzc/ferrovia_santa_cruz.git && cd ferrovia_santa_cruz
python3 fsc.py up
```

Windows (PowerShell ou Prompt de Comando, com o Docker Desktop aberto):

```bat
git clone https://github.com/rafawzc/ferrovia_santa_cruz.git
cd ferrovia_santa_cruz
python fsc.py up
```

- Na primeira chamada, o `fsc.py` **cria o `.env` a partir do `.env.example`** (senhas de dev). O `.env` é gitignored — nunca commite.
- `.env` criado antes da API (fase 3)? Troque o `JWT_SECRET` pelo do `.env.example` (32+ bytes; o antigo só gera warning do PyJWT).
- O `up` builda as imagens e sobe `db → backend → frontend` em ordem, esperando cada um ficar healthy. A primeira subida do banco demora (roda `db/schema.sql` + `db/seed.sql`).
- Abra **http://localhost:5173**.

### Usuários de dev (seed)

Senha de **todos**: `ferrovia123`.

| E-mail | Cargo | Nível de acesso |
|--------|-------|-----------------|
| `ana.admin@ferrovia.com` | admin | gestao |
| `carlos.maq@ferrovia.com` | maquinista | operacional |
| `bruna.rh@ferrovia.com` | rh | gestao |
| `cliente@email.com` | comum | cliente |

Só vale pro banco de dev. Detalhe em [`../../db/CLAUDE.md`](../../db/CLAUDE.md). Hoje (fase 1) as telas ainda usam dado mockado e o login não bate na API — os usuários passam a valer quando a auth entrar (fase 3).

## Comandos do dia a dia

No Linux e no macOS rode `python3 fsc.py <comando>` (ou `./fsc.py <comando>`, o arquivo é executável); no Windows, `python fsc.py <comando>`. A tabela usa a forma genérica `fsc.py <comando>`.

| Comando | O que faz |
|---------|-----------|
| `fsc.py up` / `fsc.py down` | sobe (em background) / derruba a stack |
| `fsc.py logs [svc]` | segue os logs de tudo ou de um serviço (`frontend`, `backend`, `db`) |
| `fsc.py ps` | lista os serviços e o estado |
| `fsc.py restart [svc]` | reinicia tudo ou um serviço |
| `fsc.py build` | reconstrói as imagens |
| `fsc.py sh <svc>` | abre um shell dentro do serviço rodando |
| `fsc.py test [args]` | pytest do backend (só o backend tem teste) |
| `fsc.py lint [fe\|be]` | lint do front, do back ou dos dois |
| `fsc.py fmt` | formata front (Prettier) e back (ruff) |
| `fsc.py typecheck` | typecheck do front |
| `fsc.py check` | **o gate completo**: lint + typecheck + format check + test + build do front. É o que o CI roda. |
| `fsc.py db` | shell do MySQL com as credenciais do `.env` |
| `fsc.py db:reset` | **apaga** o banco de dev e recria do `db/*.sql`. Pede pra digitar `reset` (`--yes` pula) |
| `fsc.py npm <args>` | npm num container descartável do front (ex: `fsc.py npm install zod`) |
| `fsc.py ui add <comp>` | adiciona componente shadcn e tira os comentários gerados (fase 2) |
| `fsc.py sim` | envia leituras simuladas de sensores (com o sistema no ar) |
| `fsc.py -v` / `--verboso` | em qualquer posição, mostra a saída completa dos comandos enxutos. Em `logs`, `sh`, `db`, `ps`, `test`, `npm`, `ui` e `sim` o `-v` é repassado ao programa de dentro (ex.: `fsc.py test -v` é o `pytest -v`) |
| `fsc.py help` | lista tudo |

**Saída enxuta e checagens.** `up`, `down`, `restart`, `build`, `check`, `lint`, `fmt`, `typecheck` e `db:reset` mostram uma linha por passo, com spinner e tempo decorrido; se um passo falha, o script imprime o log daquele passo e para. Com `-v`/`--verboso` sai tudo. `logs`, `sh`, `db`, `ps`, `test`, `npm`, `ui add` (o shadcn pode fazer perguntas) e `sim` sempre mostram a saída inteira. Antes de agir o script confere: Docker instalado, Docker rodando (ou sem permissão pro seu usuário), plugin Compose presente e, no `up`, porta `5173` livre. Cada falha vira uma linha em português dizendo o que fazer. `Ctrl+C` imprime "Interrompido.".

Antes de abrir PR: `fsc.py check` verde. Se passa local, passa no CI — é o mesmo comando.

Mudou `db/schema.sql` ou `db/seed.sql`? O volume antigo ignora a mudança: rode `fsc.py db:reset`.

## CI

`.github/workflows/ci.yml`, job **`check`**: roda `python3 fsc.py check` em todo PR e em todo push na `main`. Fora de terminal (CI) o script imprime só a linha final de cada passo. Sem ruleset (abaixo), ele só avisa — não bloqueia merge.

## Ruleset da `main` (tarefa do dono do repo)

O ruleset é o que transforma o CI em trava: ninguém empurra direto na `main`, e PR com check vermelho não entra. Só admin do repo cria ruleset. **lowh não é admin** (só push/triage), então quem faz é o **rafawzc**.

Passo a passo em `github.com/rafawzc/ferrovia_santa_cruz`:

1. **Settings** → no menu lateral, **Rules** → **Rulesets**.
2. **New ruleset** → **New branch ruleset**.
3. **Ruleset name:** `main`. **Enforcement status:** `Active`.
4. **Target branches** → **Add target** → **Include default branch** (a `main`).
5. Em **Branch rules**, marque:
   - **Restrict deletions** — ninguém apaga a `main`.
   - **Block force pushes** — ninguém reescreve o histórico da `main`.
   - **Require a pull request before merging** — nada entra sem PR.
   - **Require status checks to pass** → **Add checks** → digite `check` e selecione (é o nome do job no `ci.yml`). O check só aparece na busca depois que o workflow rodou pelo menos uma vez no repo.
6. **Create**.

Depois disso, push direto na `main` é recusado e o botão de merge só libera com o `check` verde.
