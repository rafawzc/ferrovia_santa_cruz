# API REST — contrato

> Fonte pra fase 4 (telas). Tudo aqui foi conferido rodando: testes com repo fake (`./fsc test`) **e** smoke real via proxy do Vite contra o MySQL seedado (2026-09-22). Código: `backend/app/routers/`.

## Regras gerais

- **Base:** o front chama sempre caminho relativo `/api/...` (o Vite faz proxy pro `backend:8000`). Nada de URL absoluta, nada de CORS.
- **JSON** em tudo. Datas saem em ISO 8601 **sem fuso** (`"2026-09-22T13:09:39"`), no horário do servidor MySQL (UTC no container).
- **Sessão = cookie.** `POST /api/auth/login` grava o cookie `sessao` (JWT HS256). O navegador reenvia sozinho em toda chamada same-origin — o front **não** lê nem guarda token (é `HttpOnly`, JS não enxerga). `fetch` same-origin já manda cookie por padrão.
- **Papéis** vêm de `cargo.nivel_acesso`: `cliente` < `operacional` < `gestao`. O papel é relido do banco a cada request (desativou/trocou cargo → vale na hora, sem esperar o token expirar).

### Cookie `sessao`

| Atributo | Valor |
|---|---|
| `HttpOnly` | sim |
| `SameSite` | `lax` |
| `Secure` | **não** (dev em `http://localhost`). Se um dia for pra HTTPS, ligar em `routers/auth.py`. |
| `Path` | `/` |
| `Max-Age` | `28800` (8 h) — mesmo prazo do `exp` do JWT |

Payload do JWT: `{"sub": "<usuario.id>", "papel": "<nivel_acesso>", "exp": ...}`, assinado com `JWT_SECRET` (env, ≥ 32 bytes).

### Erros

Sempre `{"detail": ...}`.

| Status | Quando | `detail` |
|---|---|---|
| `401` | sem cookie, cookie inválido/expirado, ou usuário do cookie sumiu/foi desativado | `"Não autenticado"` |
| `401` | login com e-mail ou senha errados (mesma mensagem nos dois — não revela se o e-mail existe) | `"Credenciais inválidas"` |
| `403` | papel não permite a rota | `"Sem permissão"` |
| `403` | login certo, mas usuário desativado | `"Usuário desativado"` |
| `404` | id não existe | ex: `"Usuário não encontrado"` |
| `409` | valor único repetido (ex: e-mail) | `"Registro duplicado"` |
| `409` | FK aponta pra nada (ex: `cargo_id`, `trem_id`, `linha_id` inexistente) | `"Referência inexistente"` |
| `422` | corpo inválido (Pydantic) | **lista**: `[{"type", "loc", "msg", "input", "ctx"}]` — `loc` = `["body", "<campo>"]`, `msg` em inglês (padrão do Pydantic). O front traduz por `type`/`loc`. |

Tipos de `422` que podem aparecer: `missing`, `string_too_short`, `string_too_long`, `string_pattern_mismatch` (e-mail), `greater_than` / `less_than` (peso), `int_parsing`, `bool_parsing`.

## Mapa de rotas

| Método | Rota | Quem | Sucesso |
|---|---|---|---|
| `POST` | `/api/auth/login` | público | `200` + cookie |
| `POST` | `/api/auth/logout` | público | `204` |
| `GET` | `/api/auth/me` | logado | `200` |
| `POST` | `/api/auth/cadastro` | público | `201` |
| `POST` | `/api/auth/recuperar-senha` | público | `202` |
| `GET` | `/api/usuarios` | gestao | `200` |
| `GET` | `/api/usuarios/{id}` | gestao | `200` |
| `POST` | `/api/usuarios` | gestao | `201` |
| `PATCH` | `/api/usuarios/{id}` | gestao | `200` |
| `DELETE` | `/api/usuarios/{id}` | gestao | `204` (desativa) |
| `GET` | `/api/cargos` | gestao | `200` |
| `GET` | `/api/linhas` | operacional, gestao | `200` |
| `GET` | `/api/cargas` | operacional, gestao | `200` |
| `POST` | `/api/cargas` | operacional, gestao | `201` |
| `GET` | `/api/alertas` | operacional, gestao | `200` |
| `POST` | `/api/alertas` | operacional, gestao | `201` |
| `GET` | `/api/dashboard` | operacional, gestao | `200` |
| `GET` | `/api/health` | público | `200` `{"status": "ok"}` (healthcheck do compose) |

Vocabulário (uniformização L1): as telas dizem **Rotas** e **Usuários**; a API segue o banco (`linhas`, `usuarios`). A tradução é só de rótulo, no front.

## Objeto `Usuario`

Resposta de login, me, cadastro e de todo `/api/usuarios`. Nunca inclui hash de senha.

```json
{
  "id": 1,
  "nome": "Ana Gestora",
  "email": "ana.admin@ferrovia.com",
  "telefone": "47999990001",
  "foto_url": null,
  "cargo": "admin",
  "papel": "gestao",
  "ativo": true
}
```

`cargo` = `cargo.nome` (slug, ex: `auxiliar_maquinista`); `papel` = `cargo.nivel_acesso`. Rótulo bonito do cargo ("Auxiliar de Maquinista") é do front.

## Auth

### `POST /api/auth/login`

```json
{ "email": "ana.admin@ferrovia.com", "senha": "ferrovia123" }
```

`200` → `Usuario` + `Set-Cookie: sessao=...`. `401` credenciais, `403` desativado, `422` campo faltando. O front encaminha por `papel`: `cliente` → `/perfil`, resto → `/admin`.

### `POST /api/auth/logout`

Sem corpo. `204`, apaga o cookie. Funciona mesmo sem sessão.

### `GET /api/auth/me`

`200` → `Usuario` do cookie. `401` sem sessão. É o que o `AuthContext` chama no boot pra saber se tem alguém logado.

### `POST /api/auth/cadastro`

```json
{ "nome": "Nova Pessoa", "email": "nova@email.com", "senha": "senhaforte" }
```

| Campo | Regra |
|---|---|
| `nome` | 1–120 |
| `email` | até 160, formato `x@y.z` |
| `senha` | 8–128 |

`201` → `Usuario` com `cargo: "comum"`, `papel: "cliente"` (o `DEFAULT` do banco). **Não loga** (sem cookie) — o fluxo é Cadastro → Sucesso → Login. Campo extra (ex: `cargo_id`) é ignorado. `409` e-mail já existe. "Confirmar senha" e "aceito os termos" são checagem do front.

### `POST /api/auth/recuperar-senha`

```json
{ "email": "qualquer@coisa.com" }
```

**Stub.** Sempre `202` com a mesma resposta, exista o e-mail ou não (não enumera usuário). Não manda e-mail, não gera token.

```json
{ "detail": "Se o e-mail estiver cadastrado, as instruções serão enviadas" }
```

## Usuários (só `gestao`)

### `GET /api/usuarios`

`200` → `Usuario[]`, ordenado por nome. Inclui inativos (a tela mostra Ativo/Inativo via `ativo`).

### `GET /api/usuarios/{id}`

`200` → `Usuario`. `404` se não existe.

### `POST /api/usuarios`

```json
{
  "nome": "Sergio Santana",
  "email": "sergio@ferrovia.com",
  "senha": "senhaforte",
  "cargo_id": 5,
  "telefone": "47999990009"
}
```

`nome`/`email`/`senha` com as regras do cadastro; `cargo_id` obrigatório (ids em `GET /api/cargos`); `telefone` opcional, até 20. `201` → `Usuario`. `409` e-mail repetido ou `cargo_id` inexistente.

### `PATCH /api/usuarios/{id}`

Edição **parcial**: manda só o que mudou. Todos opcionais: `nome`, `email`, `senha`, `cargo_id`, `telefone`, `ativo`.

```json
{ "telefone": "4733330000", "senha": "novasenha1" }
```

`200` → `Usuario` atualizado. `404`, `409` (e-mail repetido / cargo inexistente), `422`. `{"ativo": true}` reativa.

**Limitação:** `null` num campo = "não mexe". Não dá pra **apagar** o telefone (só trocar). Mudar isso exige SQL dinâmico; ninguém pediu ainda.

### `DELETE /api/usuarios/{id}`

**Desativa** (soft delete: `ativo = FALSE`), não apaga a linha — `relatorio.usuario_id` é `ON DELETE RESTRICT` e o histórico precisa do autor. `204`. `404` se não existe. Usuário desativado não loga (`403`) e a sessão aberta dele cai (`401`) na próxima chamada.

### `GET /api/cargos`

Pro `<select>` do cadastro/edição de funcionário.

```json
[
  { "id": 1, "nome": "comum", "papel": "cliente" },
  { "id": 5, "nome": "maquinista", "papel": "operacional" }
]
```

## Linhas (Rotas)

### `GET /api/linhas`

```json
[{ "id": 1, "numero": "1778", "status": "manutencao", "ativo": true }]
```

Ordenado por `numero`. `status` sai **cru** do ENUM do banco — o front mapeia rótulo e cor (uniformização L7):

| `status` | Rótulo | Cor |
|---|---|---|
| `manutencao` | Manutenção | amarelo |
| `atraso` | Atraso | laranja |
| `fechado` | Fechado | vermelho |
| `na_estacao` | Na estação | verde |
| `ja_partiu` | Já partiu | verde |

Também é a fonte do `<select>` de linha em Alertas e do bloco "Status das Linhas" do Dashboard.

## Carga

### `GET /api/cargas`

Mais recente primeiro.

```json
[
  {
    "id": 4,
    "tipo": "Areia fina",
    "peso_t": 10.25,
    "local_partida": "Genebra",
    "destino": "Zermatt",
    "vagao": "D",
    "trem_id": 2,
    "criado_em": "2026-09-22T13:09:39"
  }
]
```

### `POST /api/cargas`

| Campo | Regra |
|---|---|
| `tipo` | 1–80 |
| `peso_t` | toneladas, `> 0` e `< 10000` (coluna `DECIMAL(6,2)`) |
| `local_partida`, `destino` | 1–120 |
| `vagao` | opcional, até 20 |
| `trem_id` | opcional |

`201` → a carga criada (mesmo formato da lista). `409` `trem_id` inexistente.

## Alertas

### `GET /api/alertas`

Histórico, mais recente primeiro.

```json
[
  {
    "id": 4,
    "linha_id": 2,
    "linha_numero": "2645",
    "tempo_espera": "5 a 10 min",
    "motivo": "sinal quebrado",
    "status": "Atraso",
    "criado_em": "2026-09-22T13:09:39"
  }
]
```

### `POST /api/alertas`

```json
{ "linha_id": 2, "tempo_espera": "5 a 10 min", "motivo": "sinal quebrado", "status": "Atraso" }
```

| Campo | Regra |
|---|---|
| `linha_id` | obrigatório — a tela troca o texto livre "Nome da linha" por um select de `GET /api/linhas` |
| `tempo_espera` | opcional, até 40 (texto livre) |
| `motivo` | 1–200 |
| `status` | 1–40, **texto livre** no banco (`VARCHAR`, ex: "Parado") |

`201` → o alerta criado. `409` `linha_id` inexistente.

## Dashboard

### `GET /api/dashboard`

```json
{
  "linhas_ativas": 3,
  "linhas_em_manutencao": 1,
  "sensores": 4,
  "velocidade_media": 90.4
}
```

| Campo | De onde vem |
|---|---|
| `linhas_ativas` | `COUNT` de `linha` com `ativo` |
| `linhas_em_manutencao` | `COUNT` de `linha` com `status = 'manutencao'` (card "Manutenções") |
| `sensores` | `COUNT` de `sensor` |
| `velocidade_media` | `AVG(leitura_sensor.valor)` dos sensores `tipo_dado = 'velocidade'`, em km/h; `null` se não há leitura |

## O que a API **não** cobre (o schema não tem ou ninguém pediu nesta rodada)

- **Manutenções pendentes/finalizadas** (Dashboard): não existe tabela de manutenção. O card "Manutenções" usa `linhas_em_manutencao`; o modal de manutenção segue mock no front.
- **Ocupação de vagões/poltronas e passageiros** (Monitoramento de Carga): o banco não tem capacidade de vagão nem passageiro. A tela só consegue a lista de `carga` (histórico) e somar `peso_t`.
- **Velocidade/sensores por linha** (lista do Dashboard): dá pra derivar (`sensor → trem → linha`), mas não foi pedido; fica pra rodada de sensores.
- **Editar o próprio perfil** (`/perfil/editar`): fora do escopo L18. Quando vier, reusa `UsuariosService.atualizar` numa rota `PATCH /api/auth/me`.
- **Foto de perfil**: só `foto_url` em leitura; não há upload.
- **Recuperar senha de verdade** (token + e-mail): stub.
- **Ingestão IoT** (`POST /api/leituras`, L22/L23): só a arquitetura está pronta — ver `backend/CLAUDE.md`.
