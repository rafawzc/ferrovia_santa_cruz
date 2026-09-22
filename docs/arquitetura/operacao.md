# Como operar o projeto

> Tudo passa pelo `./fsc`, na raiz do repo. Ele é a porta única: sobe a stack, roda lint/teste, abre o banco e roda npm — sempre dentro dos containers. `docker compose` direto só quando o `./fsc` não tem o comando. Modelo dos containers: [`containers-e-rede.md`](containers-e-rede.md).

## Pré-requisitos

- Docker com o plugin Compose.
- Porta `5173` livre.
- Nada mais. Não instale node nem python na máquina pro projeto.

## Primeira vez

```bash
git clone https://github.com/rafawzc/ferrovia_santa_cruz.git && cd ferrovia_santa_cruz
./fsc up
```

- Na primeira chamada, o `./fsc` **cria o `.env` a partir do `.env.example`** (senhas de dev). O `.env` é gitignored — nunca commite.
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

| Comando | O que faz |
|---------|-----------|
| `./fsc up` / `./fsc down` | sobe (em background) / derruba a stack |
| `./fsc logs [svc]` | segue os logs de tudo ou de um serviço (`frontend`, `backend`, `db`) |
| `./fsc ps` | lista os serviços e o estado |
| `./fsc restart [svc]` | reinicia tudo ou um serviço |
| `./fsc sh <svc>` | abre um shell dentro do serviço rodando |
| `./fsc test [args]` | pytest do backend (só o backend tem teste) |
| `./fsc lint [fe\|be]` | lint do front, do back ou dos dois |
| `./fsc fmt` | formata front (Prettier) e back (ruff) |
| `./fsc typecheck` | typecheck do front |
| `./fsc check` | **o gate completo**: lint + typecheck + format check + test + build do front. É o que o CI roda. |
| `./fsc db` | shell do MySQL com as credenciais do `.env` |
| `./fsc db:reset` | **apaga** o banco de dev e recria do `db/*.sql`. Pede pra digitar `reset` (`--yes` pula) |
| `./fsc npm <args>` | npm num container descartável do front (ex: `./fsc npm install zod`) |
| `./fsc ui add <comp>` | adiciona componente shadcn e tira os comentários gerados (fase 2) |
| `./fsc help` | lista tudo |

Antes de abrir PR: `./fsc check` verde. Se passa local, passa no CI — é o mesmo comando.

Mudou `db/schema.sql` ou `db/seed.sql`? O volume antigo ignora a mudança: rode `./fsc db:reset`.

## CI

`.github/workflows/ci.yml`, job **`check`**: roda `./fsc check` em todo PR e em todo push na `main`. Sem ruleset (abaixo), ele só avisa — não bloqueia merge.

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
