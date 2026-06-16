# Ferrovia Santa Cruz — AI Instructions

Web app de **gerenciamento** (lado admin) e **informação** (lado cliente E admin) sobre a ferrovia Santa Cruz. Dashboard, responsivo desktop + mobile. É uma SA (Situação de Aprendizagem) — trabalho de curso técnico que dura o ano inteiro, composta de várias atividades entregues ao longo do tempo.

**Stack:** React (Vite) no frontend · FastAPI no backend (API REST) · MySQL no banco · tudo em Docker Compose.

## Core Beliefs

### P0 — Non-negotiable

- ***Introspection Before Expansion*** — Quando bater num erro, limite ou rejeição (sistema, teste ou usuário), interrogue seu PRÓPRIO output antes de tentar contornar a restrição. Assuma que a falha é sintoma de lógica falha ou inchada, não uma limitação dura — "o pacote é grande demais pra porta" significa reempacotar o pacote, não quebrar a parede. Só parta pra workarounds externos (subir limites, mover arquivos, adicionar complexidade de infra) DEPOIS de confirmar que seu output está correto e mínimo e a restrição é genuinamente inevitável. Essa é a disciplina de root-cause que `/systematic-debugging` e *No Bloat* abaixo operacionalizam.
- ***Planning First*** — Ao desenhar um plano, entrar em Plan Mode, ou idear qualquer feature/arquitetura — use a skill `/brainstorming` ***SEMPRE*** antes de pular pra implementação.
- ***TDD*** — Ao implementar qualquer feature ou bugfix, SEMPRE use `/tdd` antes de escrever código de implementação. RED → GREEN → REFACTOR.
- ***Systematic Debugging*** — Ao debugar qualquer bug, falha de teste ou comportamento inesperado, SEMPRE use `/systematic-debugging`. Sem fix sem investigar a causa raiz primeiro.
- ***Managing Tasks*** — Externalize qualquer trabalho não-trivial no TaskManager (TaskCreate com dependências explícitas via `blockedBy`). Nunca execute lógica multi-passo inline sem um grafo de tarefas.
- ***Docker Compose only*** — Tudo roda em containers. Use `docker compose` a partir da raiz do repo pra TODAS as operações (subir, logs, exec, testes). Nunca rode o backend/frontend direto na máquina host esperando que "funcione igual" — o ambiente de verdade é o do container.
- ***SQL sempre parametrizado*** — O acesso ao MySQL é **SQL puro** (sem ORM). Isso significa que VOCÊ é responsável pela segurança: TODA query com valor vindo de fora (request, query param, body, header) usa placeholders parametrizados (`%s` no mysql-connector / `cursor.execute(sql, params)`), NUNCA f-string / concatenação / `.format()` montando SQL. String interpolada em SQL = SQL injection = reprovado. Sem exceção, nem em "query interna que ninguém chama de fora".
- ***Evidence Before Completion*** — Nunca declare trabalho "pronto", "corrigido", "passando" ou "funcionando" sem ter ACABADO de rodar o comando de verificação e lido o output. Sem exceção, sem "deve passar", sem confiar em rodada anterior, sem confiar no relatório de sucesso de um agente — re-cheque o diff/output você mesmo. Vale pra: testes passando, lint verde, build ok, bug corrigido, requisito satisfeito, trabalho delegado a agente. Se não consegue mostrar evidência na mesma mensagem, diga o status real em vez disso.
- ***Documentar ao fechar*** — Implementação NÃO está completa quando o código passa nos testes — está completa quando está **documentada**. Todo fechamento de feature/bugfix/atividade tem um **step de documentação obrigatório** (ver seção *Documentação* abaixo): (1) atualizar os `CLAUDE.md` de pasta tocados com qualquer quirk/decisão/gotcha não-óbvio que você descobriu, e (2) atualizar a pasta `docs/` (incluindo `docs/CLAUDE.md`, o índice) com o que o cliente/professora/próximo-agente precisa saber. Isso é uma SA avaliada — documentação fraca = nota fraca, independente de o código funcionar. Pulou o step de doc = trabalho não fechado. Não diga "pronto" sem ter documentado.
- ***No Bloat, No Duplication, No Over-engineering*** — Entregue o mínimo de código que resolve a tarefa pedida. NADA a mais. Antes de escrever função/arquivo/abstração nova, faça grep por uma existente e reúse. Proibido sem pedido explícito do usuário: implementações paralelas do que já existe, knobs "flexíveis"/"configuráveis", camadas wrapper, interfaces adapter pra um único caller, validação defensiva em fronteiras internas, tratamento de erro pra estados impossíveis, fallbacks pra casos que não acontecem, generalização prematura, shims de retrocompat, código morto "pra depois", TODOs especulativos, helpers usados uma vez, ou config flag pra um valor só. Se dá pra fazer em 30 linhas, NÃO escreva 200. Toda linha tem que rastrear até o pedido do usuário — se não consegue justificar em voz alta, apague. Na dúvida: menos código, menos arquivos, menos abstrações. **O procedimento pra cumprir isso na hora de escrever é a skill `/ponytail`** (a escada de decisão + a guarda do que nunca se corta) — roda dentro do GREEN do `/tdd`.

### P1 — Standard

- **CLAUDE.md como conhecimento vivo, espalhado pelo codebase** — Haverá `CLAUDE.md` em pastas relevantes por TODO o codebase (`backend/`, `backend/<modulo>/`, `frontend/`, `frontend/src/<area>/`, `db/`), cada um explicando *proceduralmente* o conteúdo importante daquela pasta — o que vive ali, como as peças se conectam, os quirks e decisões não-óbvias. **Estude o CLAUDE.md da pasta antes de implementar naquela área.** Se descobrir algo no sufoco, escreva no CLAUDE.md relevante pro próximo agente não queimar os mesmos ciclos. Se é óbvio lendo o código, pule — o CLAUDE.md captura o que NÃO é óbvio. Criar uma pasta nova com lógica de peso → criar (ou herdar) seu CLAUDE.md faz parte do trabalho.
- **Progresso incremental sobre big bangs** — Mudanças pequenas que compilam e passam nos testes.
- **Valide premissas com WebSearch** ao planejar — seu conhecimento pode estar desatualizado (versões de libs, APIs de framework).
- **Mudanças cirúrgicas** — Toque só no que a tarefa exige. Não "melhore" código adjacente, comentários ou formatação. Não refatore o que não está quebrado. Combine com o estilo existente mesmo que você escrevesse diferente. Se notar código morto ou smell não-relacionado, mencione — não conserte silenciosamente. Só limpe órfãos que suas próprias mudanças criaram (imports/vars/funções sem uso).
- **Passos verificáveis e dirigidos a objetivo** — Traduza tarefas vagas em checagens. "Adicionar validação" → "Escreva testes pra inputs inválidos, depois faça passar." "Corrigir o bug" → "Escreva um teste que falha reproduzindo, deixe verde." Pra trabalho multi-passo, liste cada passo com seu comando de verificação antes de começar.
- **Mobile-first e responsivo de verdade** — Toda tela funciona em mobile E desktop. Comece pelo layout mobile, depois suba pros breakpoints maiores. Nada de "depois eu adapto pro celular". Teste os dois antes de declarar uma tela pronta.

### P2 — Principles

- **Pragmático sobre dogmático** — Adapte à realidade do projeto e à entrega da SA.
- **Intenção clara sobre código esperto** — Seja chato e óbvio.
- Sem comentários no código — seu código já deve ser legível por humano. (Exceção: comentário explicando um *porquê* não-óbvio, nunca um *o quê*.)
- Single Responsibility, mas pragmático sobre quando aplicar.
- **Exponha confusão, não esconda** — Se um pedido tem múltiplas interpretações válidas, apresente-as, não escolha em silêncio. Se algo está incerto, nomeie o que confunde e pergunte.

## Arquitetura

```
ferrovia_santa_cruz/
├── frontend/           # React + Vite — UI responsiva (admin + cliente)
│   └── CLAUDE.md       # + CLAUDE.md em subpastas relevantes de src/
├── backend/            # FastAPI — API REST, SQL puro pro MySQL
│   └── CLAUDE.md       # + CLAUDE.md por módulo relevante
├── db/                 # init/seed SQL do MySQL (schema, dados iniciais)
├── docs/               # documentação do projeto (ver seção Documentação)
│   └── CLAUDE.md       # ÍNDICE da pasta docs
├── docker-compose.yml  # 3 serviços: frontend, backend, db
└── .claude/
    ├── CLAUDE.md       # este arquivo — instruções raiz do agente
    └── skills/         # brainstorming, tdd, systematic-debugging, ponytail
```

Os `CLAUDE.md` de pasta (`backend/`, `frontend/`, …) são os "espalhados" do P1 — conhecimento procedural local. Este (`.claude/CLAUDE.md`) é a raiz que governa tudo.

### Modelo de containers e rede (requisito firme)

**Detalhe completo, com o porquê do proxy, o esqueleto do compose e o checklist: [`docs/arquitetura/containers-e-rede.md`](../docs/arquitetura/containers-e-rede.md). LEIA antes de mexer no compose, Dockerfiles ou na forma como o front chama a API.**

Três containers (`frontend`, `backend`, `db`), conectados **só por rede interna**. As regras firmes que NÃO podem cair:

```
Navegador (você)  ──:5173──►  [frontend]  ──rede interna──►  [backend]  ──rede interna──►  [db]
   (fora da rede docker)      Vite proxy /api→backend:8000    FastAPI (sem ports:)          MySQL (sem ports:)
```

- **Só o `frontend` é exposto.** `backend` e `db` nunca publicam porta — alcançáveis só pelo nome do serviço na rede `internal`.
- **Front chama a API por caminho relativo `/api/...`**, nunca URL absoluta do backend. É isso que mantém o backend não-exposto (o Vite faz proxy `/api → backend:8000`; React roda no browser, fora da rede docker — por isso o container precisa fazer proxy, não servir só estáticos).
- **`depends_on` em cadeia `db → backend → frontend`**, com `condition: service_healthy` (não `depends_on` cru — o MySQL demora a aceitar conexão e o backend quebraria no boot).

## Documentação

**Mapa vivo da documentação: [`docs/CLAUDE.md`](../docs/CLAUDE.md) (índice). Decisões técnicas com o *porquê*: [`docs/decisoes/stack.md`](../docs/decisoes/stack.md). Comece por aí quando precisar de contexto.**

Documentação é cidadã de primeira classe aqui (ver P0 *Documentar ao fechar*). É uma SA avaliada por entregas ao longo do ano — a doc é metade da nota e o que faz o trabalho ser navegável daqui a 6 meses. Duas frentes complementares: **`docs/`** (documentação do projeto, pra humano — você, professora, colegas) e **`CLAUDE.md` espalhados** (conhecimento procedural local, pro próximo agente). As duas se atualizam no fechamento de cada implementação.

### Estrutura da `docs/` — profundidade final de 2, sem exceção

A regra existe pra granularizar bem **sem** poluir a primeira camada com mil pastas. Profundidade máxima = 2: `docs/<area-geral>/<subtema>/arquivo.md`. Nada mais fundo que isso.

```
docs/
├── CLAUDE.md                 # ÍNDICE da pasta docs — o que vive em cada área geral (camada 1)
├── <area-geral>/             # CAMADA 1 — poucas, amplas (ex: arquitetura, frontend, backend, banco, api, deploy, entregas)
│   ├── <tema>.md             # arquivo direto na área geral
│   └── <subtema>/            # CAMADA 2 — subpasta pra granularizar um tema grande
│       ├── <coisa>.md
│       └── <outra-coisa>.md  # PROFUNDIDADE FINAL — nada mais fundo
└── <outra-area-geral>/
    └── ...
```

Regras duras:
- **Camada 1 = pastas gerais e amplas, em pouca quantidade.** Antes de criar uma pasta nova na primeira camada, pergunte: "isso não é subtema de uma área geral que já existe?" Se for, vira subpasta (camada 2), não pasta nova na raiz. A primeira camada de `docs/` deve caber numa olhada.
- **Profundidade final = 2.** `docs/backend/auth/jwt.md` ✅ · `docs/backend/auth/tokens/refresh.md` ❌ (fundo demais — repensa a granularização).
- **Arquivos podem viver na camada 1 ou 2.** Tema pequeno → arquivo direto na área geral (`docs/deploy/docker.md`). Tema grande → subpasta com vários arquivos.
- **`docs/CLAUDE.md` é o índice** — uma linha por área geral dizendo o que tem dentro. É o mapa: quem chega no `docs/` lê esse arquivo primeiro e sabe onde tudo está. Toda vez que cria/remove uma área geral ou muda o que ela contém, **atualiza o índice na mesma tacada** — índice desatualizado é pior que índice nenhum.

### CLAUDE.md espalhados (conhecimento procedural local)

Complementam a `docs/`, mas têm propósito diferente: a `docs/` explica o projeto pra humano; os `CLAUDE.md` de pasta explicam *proceduralmente* o conteúdo daquela pasta pro próximo agente (ver P1 *CLAUDE.md como conhecimento vivo*). Pasta com lógica de peso merece um `CLAUDE.md` descrevendo o que vive ali, como se conecta, e os gotchas.

### O step de documentação (fechamento de toda implementação)

Antes de declarar QUALQUER feature/bugfix/atividade fechada, rode este checklist — faz parte do trabalho, não é opcional:

- [ ] Toquei lógica não-óbvia numa pasta? → atualizei o `CLAUDE.md` daquela pasta (criei se a pasta era nova e tem peso).
- [ ] A implementação mudou/adicionou algo que humano precisa saber (arquitetura, fluxo, contrato de API, schema, decisão)? → documentei na área certa de `docs/`, respeitando a profundidade 2.
- [ ] Criei/removi/renomeei uma área geral em `docs/`? → atualizei `docs/CLAUDE.md` (o índice) na mesma tacada.
- [ ] A doc descreve o comportamento *real* do que ficou pronto (não o que eu *planejava* fazer)?

Pulou qualquer caixa = trabalho não fechado.

## Backend — FastAPI + SQL puro

**Como-fazer completo (conexão centralizada, pool, cursores, exemplos): [`docs/backend/acesso-a-dados.md`](../docs/backend/acesso-a-dados.md). LEIA antes de escrever qualquer acesso ao banco.**

- API REST. Endpoints sob `/api/...` (o frontend chega aí via proxy).
- Acesso ao MySQL é **SQL puro** via `mysql-connector-python` — sem ORM, sem SQLAlchemy. Decisão de projeto, respeite.
- **TODA query parametrizada** (ver P0 *SQL sempre parametrizado*). `cursor.execute("SELECT ... WHERE id = %s", (id,))` — nunca f-string.
- Centralize a conexão/pool num único módulo; não abra conexão crua espalhada. Sempre feche cursor/conexão (context manager).
- Valide input na fronteira com Pydantic (models de request/response). Erro de validação → 4xx com mensagem clara, nunca 500 silencioso.
- Segredos (senha do MySQL etc.) vêm de variável de ambiente / `.env` gitignored — nunca hardcoded.

## Frontend — React + Vite

**Padrões responsivos, consumo de API e os dois lados (admin/cliente) em detalhe: [`docs/frontend/responsividade.md`](../docs/frontend/responsividade.md).**

- Build/dev: **Vite**. Testes: **Vitest** + Testing Library.
- **Responsivo mobile-first** (ver P1). Comece mobile, suba breakpoints.
- Chamadas à API por caminho relativo `/api/...` (o proxy do Vite resolve). Nunca URL absoluta do backend.
- Dois lados: **admin** (gerenciamento + informação) e **cliente** (informação). Pense nas rotas/guards desde cedo.
- Design vem em imagens (mobile e desktop separados) fornecidas pelo usuário — siga-as. Quando houver um sistema de design/tokens definido, consuma os tokens, não chumbe valores soltos.

## Skills disponíveis

| Skill | Quando |
|-------|--------|
| `/brainstorming` | Antes de QUALQUER trabalho criativo — desenhar feature, modelar arquitetura, escopar bugfix. Constrói uma spec viva e grila cada decisão até zero ambiguidade. |
| `/tdd` | Antes de escrever qualquer código de implementação (feature ou bugfix). RED → GREEN → REFACTOR. |
| `/systematic-debugging` | Ao encontrar qualquer bug, falha de teste ou comportamento inesperado, antes de propor fix. |
| `/ponytail` | Ao escrever código de implementação — antes de criar função/arquivo/dep/abstração e durante o GREEN do `/tdd`. Força a solução mais enxuta que resolve, sem furar segurança / perda-de-dados / a11y. O melhor código é o que você não escreveu. |

## NEVER

- Commitar API keys, senhas, tokens ou segredos (`.env` é gitignored por um motivo).
- Montar SQL com string interpolada/concatenada quando há valor externo — sempre parametrizado.
- Expor porta do `backend` ou do `db` pra fora — só o `frontend` é exposto.
- Deletar ou alterar o banco sem confirmação explícita do usuário.
- Pular testes que falham pra "destravar" uma entrega.
- Declarar tela pronta sem testar em mobile E desktop.

## Git

- Branches de feature saem de `main`.
- Nunca push direto em `main` quando o trabalho merece revisão — abra PR.
- Conventional commits com boas descrições. Commits separados quando fizer sentido.
- Nunca referencie Claude Code / IA em commits ou PRs.

## Testes

```bash
docker compose exec backend pytest         # backend (FastAPI) — pytest
docker compose exec frontend npm run test  # frontend (React) — Vitest
```

Rode os testes pelo container (ver P0 *Docker Compose only*) — o ambiente de verdade é o do container, não o host.
