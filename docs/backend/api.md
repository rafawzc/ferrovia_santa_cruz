# API REST — contrato

> Espelho do contrato. O código vence: `backend/app/routers/` (rotas e Pydantic) e `backend/app/services/` (regra). O front espelha este arquivo em `frontend/src/lib/api/types.ts`. Atualizado em 2026-11-03 contra o código.

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
| `400` | `PATCH /api/auth/me` trocando senha com `senha_atual` ausente ou errada | `"Senha atual incorreta"` |
| `401` | sem cookie, cookie inválido/expirado, ou usuário do cookie sumiu/foi desativado | `"Não autenticado"` |
| `401` | login com e-mail ou senha errados (mesma mensagem nos dois — não revela se o e-mail existe) | `"Credenciais inválidas"` |
| `401` | `/api/leituras` de sensor com `X-API-Key` ausente ou errada | `"Chave de sensor invalida"` (sem acento, como no código) |
| `403` | papel não permite a rota | `"Sem permissão"` |
| `403` | login certo, mas usuário desativado | `"Usuário desativado"` |
| `403` | desativar a própria conta (`DELETE` ou `PATCH {"ativo": false}` em `/api/usuarios/{id}`) | `"Você não pode desativar a própria conta"` |
| `404` | id não existe | ex: `"Usuário não encontrado"`, `"Trem não encontrado"`, `"Viagem não encontrada"` |
| `409` | valor único repetido (ex: e-mail, prefixo de trem, código de sensor) | `"Registro duplicado"` |
| `409` | FK aponta pra nada (ex: `cargo_id`, `trem_id`, `linha_id` inexistente) | `"Referência inexistente"` |
| `409` | `DELETE` de registro que outro ainda referencia (trem com sensor ou viagem, sensor com leitura, rota com viagem) | `"Registro em uso por outro cadastro"` |
| `409` | outro erro de integridade do MySQL | `"Conflito de integridade"` |
| `409` | deixaria o sistema sem administrador ativo (ver [Trava do último administrador](#trava-do-último-administrador)) | `"O sistema precisa de pelo menos um administrador ativo"` |
| `503` | não foi possível abrir conexão com o MySQL (banco fora do ar, host errado, pool esgotado) | `"Banco de dados indisponível"` |
| `422` | corpo inválido (Pydantic) | **lista**: `[{"type", "loc", "msg", "input", "ctx"}]` — `loc` = `["body", "<campo>"]`, `msg` em inglês (padrão do Pydantic). O front traduz por `type`/`loc`. |

O `503` vale pra **qualquer** rota que toque o banco: quem falha é o `cursor()` ao pegar a conexão, antes de qualquer SQL. Assim que o MySQL volta, o pool reconecta sozinho (~5s) — não precisa reiniciar o backend.

Tipos de `422` que podem aparecer: `missing`, `string_too_short`, `string_too_long`, `string_pattern_mismatch` (e-mail), `greater_than` / `less_than` (peso), `int_parsing`, `bool_parsing`, `literal_error` (valor fora do conjunto, ex: `papel`, `status`, `tipo`), `extra_forbidden` (campo não permitido no `PATCH /api/auth/me`).

## Mapa de rotas

| Método | Rota | Quem | Sucesso |
|---|---|---|---|
| `POST` | `/api/auth/login` | público | `200` + cookie |
| `POST` | `/api/auth/logout` | público | `204` |
| `GET` | `/api/auth/me` | logado | `200` |
| `PATCH` | `/api/auth/me` | logado (qualquer papel) | `200` |
| `POST` | `/api/auth/cadastro` | público | `201` |
| `POST` | `/api/auth/recuperar-senha` | público | `202` |
| `GET` | `/api/usuarios` | gestao | `200` |
| `GET` | `/api/usuarios/{id}` | gestao | `200` |
| `POST` | `/api/usuarios` | gestao | `201` |
| `PATCH` | `/api/usuarios/{id}` | gestao | `200` |
| `DELETE` | `/api/usuarios/{id}` | gestao | `204` (desativa) |
| `POST` | `/api/usuarios/{id}/senha-temporaria` | gestao | `200` |
| `GET` | `/api/cargos` | gestao | `200` |
| `GET` | `/api/linhas` | operacional, gestao | `200` |
| `POST` `PATCH` `DELETE` | `/api/linhas`, `/api/linhas/{id}` | gestao | `201` / `200` / `204` |
| `GET` | `/api/trens`, `/api/trens/{id}` | operacional, gestao | `200` |
| `POST` `PATCH` `DELETE` | `/api/trens`, `/api/trens/{id}` | gestao | `201` / `200` / `204` |
| `GET` | `/api/sensores`, `/api/sensores/{id}` | operacional, gestao | `200` |
| `POST` `PATCH` `DELETE` | `/api/sensores`, `/api/sensores/{id}` | gestao | `201` / `200` / `204` |
| `GET` | `/api/viagens`, `/api/viagens/{id}` | **cliente**, operacional, gestao | `200` |
| `POST` `PATCH` `DELETE` | `/api/viagens`, `/api/viagens/{id}` | gestao | `201` / `200` / `204` |
| `GET` | `/api/cargas` | operacional, gestao | `200` |
| `POST` | `/api/cargas` | operacional, gestao | `201` |
| `GET` | `/api/alertas` | operacional, gestao | `200` |
| `POST` | `/api/alertas` | operacional, gestao | `201` |
| `PATCH` | `/api/alertas/{id}` | operacional, gestao | `200` |
| `GET` | `/api/dashboard` | cliente, operacional, gestao | `200` |
| `GET` | `/api/relatorios`, `/api/relatorios/csv` | gestao | `200` |
| `GET` | `/api/leituras` | operacional, gestao | `200` |
| `POST` | `/api/leituras` | sensor (`X-API-Key`) | `201` |
| `GET` | `/api/leituras/sensores` | sensor (`X-API-Key`) | `200` |
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
  "ativo": true,
  "trem_id": null
}
```

`cargo` = `cargo.nome` (slug, ex: `auxiliar_maquinista`); `papel` = `cargo.nivel_acesso`; `trem_id` = trem que o usuário opera (`null` se não tem vínculo). Rótulo bonito do cargo ("Auxiliar de Maquinista") é do front (`src/lib/rotulos.ts`).

## Auth

### `POST /api/auth/login`

```json
{ "email": "ana.admin@ferrovia.com", "senha": "ferrovia123" }
```

`200` → `Usuario` + `Set-Cookie: sessao=...`. `401` credenciais, `403` desativado, `422` campo faltando. O front encaminha por `papel`: `cliente` → `/viagens`, resto → `/admin`.

### `POST /api/auth/logout`

Sem corpo. `204`, apaga o cookie. Funciona mesmo sem sessão.

### `GET /api/auth/me`

`200` → `Usuario` do cookie. `401` sem sessão. É o que o contexto de autenticação (`contexts/Autenticacao.tsx`) chama no boot pra saber se tem alguém logado.

### `PATCH /api/auth/me`

O próprio usuário logado (qualquer papel, inclusive `cliente`) edita o seu perfil. Edição **parcial**, todos opcionais:

| Campo | Regra |
|---|---|
| `nome` | 1–120 |
| `email` | até 160, formato `x@y.z` |
| `telefone` | até 20 |
| `senha` | 8–128; **exige** `senha_atual` correta |
| `senha_atual` | só conferida quando vem `senha` |

```json
{ "telefone": "47999990000", "senha": "novasenha1", "senha_atual": "ferrovia123" }
```

`200` → `Usuario` atualizado (mesmo formato do `GET /api/auth/me`). O cookie continua válido (o JWT só carrega o id).

| Status | Quando |
|---|---|
| `400` `"Senha atual incorreta"` | veio `senha` sem `senha_atual` ou com ela errada. Não é `401` (o front leria como sessão caída) nem `403` (reservado a papel/desativado). Nada é gravado. |
| `401` | sem sessão |
| `409` | e-mail já usado por outro usuário |
| `422` | regra de campo violada, ou campo fora da lista (ex: `cargo_id`, `ativo`, `foto_url`) → `type: "extra_forbidden"`. Ninguém se promove nem se reativa. |

Mesma limitação do `PATCH /api/usuarios/{id}`: `null` = "não mexe", não dá pra apagar o telefone.

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

Query params, todos opcionais e combináveis (AND):

| Param | Regra |
|---|---|
| `busca` | texto; casa `LIKE %busca%` em `nome` **ou** `email`. `%` e `_` digitados não são escapados e valem como curinga. |
| `papel` | `cliente`, `operacional` ou `gestao` (filtra `cargo.nivel_acesso`); outro valor → `422` |
| `ativo` | `true` ou `false`; omitido = ativos e inativos |

`200` → `Usuario[]`, ordenado por nome. Sem filtro, inclui inativos (a tela mostra Ativo/Inativo via `ativo`). Sem resultado: `200` com `[]`.

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

`200` → `Usuario` atualizado. `404`, `409` (e-mail repetido / cargo inexistente / trava do último administrador), `403` (desativar a si mesmo), `422`. `{"ativo": true}` reativa.

**Limitação:** `null` num campo = "não mexe". Não dá pra **apagar** o telefone (só trocar). Mudar isso exige SQL dinâmico; ninguém pediu ainda.

### `DELETE /api/usuarios/{id}`

**Desativa** (soft delete: `ativo = FALSE`), não apaga a linha — `relatorio.usuario_id` é `ON DELETE RESTRICT` e o histórico precisa do autor. `204`. `404` se não existe. `403` se o alvo é quem chama; `409` na trava abaixo. Usuário desativado não loga (`403`) e a sessão aberta dele cai (`401`) na próxima chamada.

### Trava do último administrador

"Administrador" = usuário ativo cujo cargo tem `nivel_acesso = 'gestao'`. O sistema recusa com `409` `"O sistema precisa de pelo menos um administrador ativo"` (`services/usuarios.py`):

- **desativar** esse administrador, por `DELETE` ou `PATCH {"ativo": false}`, quando ele é o único ativo;
- **trocar o cargo** dele por um de papel diferente de `gestao` (`PATCH {"cargo_id": ...}`), quando ele é o único ativo. Trocar por outro cargo de `gestao` passa; trocar o cargo de administrador quando há outro ativo passa.

Quando o alvo é o único administrador e é quem chama, vale o `409` (checado antes do `403` de auto-desativação).

### `POST /api/usuarios/{id}/senha-temporaria`

Sem corpo. Gera 12 caracteres aleatórios (sem `I`, `O`, `l`, `0`, `1`), grava o hash no lugar da senha atual (a antiga deixa de valer na hora) e devolve a senha em texto **só nesta resposta**:

```json
{ "senha_temporaria": "k7Hq2mXpR9sT" }
```

`404` se o usuário não existe. Decisão: [`../decisoes/fechamento-sa.md`](../decisoes/fechamento-sa.md) (E3).

### `GET /api/cargos`

Pro `<select>` do cadastro/edição de funcionário.

```json
[
  { "id": 1, "nome": "comum", "papel": "cliente" },
  { "id": 5, "nome": "maquinista", "papel": "operacional" }
]
```

## Linhas (Rotas)

Objeto: `{ id, numero, origem, destino, status, ativo }`. Escrita só `gestao`; leitura `operacional` e `gestao`.

- `GET /api/linhas?status=...` — ordenado por `numero`; `status` opcional.
- `POST /api/linhas` — `numero` 1–20, `origem` e `destino` 1–120, `status` (obrigatório), `ativo` (padrão `true`). `201`. `409` número repetido (`numero` é único).
- `PATCH /api/linhas/{id}` — parcial; `null` = não mexe. `404` `"Linha não encontrada"`.
- `DELETE /api/linhas/{id}` — `204`; `404`; `409` `"Registro em uso por outro cadastro"` se a rota tem viagem (`viagem.linha_id` é `RESTRICT`). Alerta manual da rota some junto (`ON DELETE CASCADE`).

`status` sai **cru** do ENUM do banco — o front mapeia rótulo e cor (uniformização L7):

| `status` | Rótulo | Cor |
|---|---|---|
| `manutencao` | Manutenção | amarelo |
| `atraso` | Atraso | laranja |
| `fechado` | Fechado | vermelho |
| `na_estacao` | Na estação | verde |
| `ja_partiu` | Já partiu | verde |

## Trens

Leitura `operacional` e `gestao`; escrita só `gestao`.

```json
{
  "id": 1, "prefixo": "TR-204", "modelo": "Série 7", "ano": 2018, "capacidade_t": 320.5,
  "status": "ativo", "ultima_inspecao": "2026-10-01", "linha_id": 2, "linha_numero": "2645",
  "total_sensores": 4
}
```

- `GET /api/trens?busca=&status=` — ordenado por `prefixo`. `busca` casa `LIKE %busca%` em `prefixo` ou `modelo`; `status` ∈ `ativo`, `manutencao`, `parado`.
- `GET /api/trens/{id}` — `404` `"Trem não encontrado"`.
- `POST /api/trens` — `prefixo` 1–20 (único), `modelo` 1–80, `ano` 1900–2100, `capacidade_t` `> 0`, `status` (padrão `ativo`), `ultima_inspecao` (data `AAAA-MM-DD`, opcional), `linha_id` (opcional). `201`. `409` prefixo repetido ou `linha_id` inexistente.
- `PATCH /api/trens/{id}` — parcial; `null` = não mexe (não dá pra limpar `ultima_inspecao` nem `linha_id`).
- `DELETE /api/trens/{id}` — `204`; `409` `"Registro em uso por outro cadastro"` se tem sensor ou viagem. Carga e vínculo de usuário viram `NULL`.

`linha_numero` e `total_sensores` são só de saída.

## Sensores

Leitura `operacional` e `gestao`; escrita só `gestao`.

```json
{
  "id": 3, "codigo": "S-VEL-001", "nome": "Velocímetro frontal", "tipo_dado": "velocidade",
  "localizacao": "Cabine", "segmento": null, "trem_id": 1, "trem_prefixo": "TR-204",
  "trem_modelo": "Série 7", "ultima_leitura_status": "normal", "ultima_leitura_valor": 92.4,
  "ultima_leitura_data": "2026-11-03T14:00:00"
}
```

- `GET /api/sensores?tipo=&trem_id=` — `tipo` ∈ `velocidade`, `temperatura`, `falha`, `energia`, `localizacao`.
- `GET /api/sensores/{id}` — `404` `"Sensor não encontrado"`.
- `POST /api/sensores` — `codigo` 1–20 (único), `nome` 1–80, `tipo_dado`, `localizacao` 1–120, `segmento` (opcional, até 80), `trem_id`. `201`. `409` código repetido ou `trem_id` inexistente.
- `PATCH /api/sensores/{id}` — parcial; `null` = não mexe (não dá pra limpar `segmento`).
- `DELETE /api/sensores/{id}` — `204`; `409` `"Registro em uso por outro cadastro"` se já tem leitura.

`ultima_leitura_*` são derivados da leitura mais recente (`null` sem leitura) — [`../decisoes/fechamento-sa.md`](../decisoes/fechamento-sa.md) (E7). `ultima_leitura_status` ∈ `normal`, `alerta`, `falha`.

## Viagens

Objeto:

```json
{
  "id": 7, "linha_id": 2, "linha_numero": "2645", "origem": "Genebra", "destino": "Zermatt",
  "trem_id": 1, "trem_prefixo": "TR-204", "partida_prevista": "2026-11-03T12:00:00",
  "chegada_prevista": "2026-11-03T15:30:00", "status": "em_andamento",
  "criado_em": "2026-11-01T09:00:00"
}
```

**Leitura** (`GET`): `cliente`, `operacional` e `gestao`. **Escrita** (`POST`, `PATCH`, `DELETE`): só `gestao` (`403` para os outros).

- `GET /api/viagens?status=&trem_id=&linha_id=&data=` — todos opcionais, combinados com AND; mais recente primeiro (`partida_prevista` desc). `status` ∈ `programada`, `em_andamento`, `concluida`, `cancelada`, `atrasada`. `data` (`AAAA-MM-DD`) filtra as que **partem** naquele dia. `cliente` vê todas as viagens: não há filtro por dono.
- `GET /api/viagens/{id}` — `404` `"Viagem não encontrada"`.
- `POST /api/viagens` — `linha_id`, `trem_id`, `partida_prevista`, `chegada_prevista` (datetime), `status` (padrão `programada`). `201`. `409` rota ou trem inexistente. O backend **não** confere se a chegada vem depois da partida (quem confere é o formulário).
- `PATCH /api/viagens/{id}` — parcial; `null` = não mexe.
- `DELETE /api/viagens/{id}` — `204`; `404`.

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

`operacional` e `gestao`. Um alerta é **manual** (tem `linha_id`) ou **automático** (nasce de uma leitura de sensor, tem `leitura_id` e `linha_id` nulo).

```json
{
  "id": 4, "linha_id": 2, "linha_numero": "2645", "leitura_id": null, "tipo": "via",
  "severidade": "atencao", "tempo_espera": "5 a 10 min", "motivo": "sinal quebrado",
  "status": "Atraso", "tratado": false, "criado_em": "2026-09-22T13:09:39"
}
```

### `GET /api/alertas`

Mais recente primeiro. Filtros opcionais (AND): `severidade` (`normal`, `atencao`, `critico`), `tipo` (igualdade exata, não busca parcial), `tratado` (`true`/`false`).

### `POST /api/alertas`

| Campo | Regra |
|---|---|
| `linha_id` | obrigatório (a tela usa um select de `GET /api/linhas`) |
| `tipo` | 1–40, texto livre |
| `severidade` | `normal` (padrão), `atencao`, `critico` |
| `tempo_espera` | opcional, até 40 (texto livre) |
| `motivo` | 1–200 |
| `status` | 1–40, **texto livre** no banco (`VARCHAR`, ex: "Parado") |

`201` → o alerta criado. `409` `linha_id` inexistente.

### `PATCH /api/alertas/{id}`

```json
{ "tratado": true }
```

Marca ou reabre (`false`). `200` → o alerta. `404` `"Alerta não encontrado"`. "Alerta ativo" = `tratado = false`.

## Dashboard

### `GET /api/dashboard`

Qualquer papel logado. O conteúdo depende de quem chama (`services/dashboard.py`):

```json
{
  "trens_por_status": [{ "status": "ativo", "quantidade": 2 }],
  "alertas_ativos_por_severidade": [{ "severidade": "critico", "quantidade": 3 }],
  "sensores_criticos": 2,
  "viagens_em_andamento": 4,
  "velocidade_media": 90.4
}
```

| Campo | De onde vem |
|---|---|
| `trens_por_status` | `COUNT` de `trem` agrupado por `status`, ordenado por status. Só aparecem status que têm trem. |
| `alertas_ativos_por_severidade` | alertas com `tratado = false`, agrupados por `severidade`. Com filtro de trem, só contam os automáticos ligados a sensor daquele trem (o alerta manual não tem trem). |
| `sensores_criticos` | sensores cuja **última** leitura tem `status_operacional = 'falha'` |
| `viagens_em_andamento` | viagens com `status = 'em_andamento'` |
| `velocidade_media` | média (1 casa) das leituras de sensores `velocidade` nas **últimas 24 h**, em km/h; `null` se não há leitura na janela |

| Papel | Resposta |
|---|---|
| `gestao` | os cinco campos, da frota inteira |
| `operacional` com `trem_id` | os cinco campos, só do trem dele (listas e contagens podem ser `[]`/`0`; `velocidade_media` `null` sem leitura) |
| `operacional` **sem** trem vinculado | `trens_por_status`, `alertas_ativos_por_severidade`, `sensores_criticos` e `velocidade_media` = `null`; `viagens_em_andamento` = `0`. `null` quer dizer "não se aplica", diferente de `[]`/`0` ("aplica e não há nada") |
| `cliente` | só `viagens_em_andamento` (da frota inteira); os outros quatro `null` |

A tela `/admin` só é aberta por `operacional` e `gestao`; o `cliente` pode chamar o endpoint, mas nenhuma tela dele o usa.

## Relatórios (só `gestao`)

### `GET /api/relatorios`

Query: `tipo` (`desempenho`, `consumo`, `eficiencia`, `manutencao`), `inicio` e `fim` (datas `AAAA-MM-DD`, **todas obrigatórias**; faltou ou inválida → `422`), `trem_id` (opcional). O período é inclusivo nas duas pontas (o fim vai até 23:59:59). O backend **não** rejeita `fim < inicio` (volta vazio); quem confere é o formulário. A geração não grava nada em `relatorio` ([`../decisoes/fechamento-sa.md`](../decisoes/fechamento-sa.md), E10).

```json
{
  "tipo": "desempenho", "inicio": "2026-10-01", "fim": "2026-10-31", "trem_id": null,
  "colunas": [{ "chave": "trem_prefixo", "rotulo": "Trem" }, { "chave": "velocidade_media", "rotulo": "Velocidade média (km/h)" }],
  "linhas": [{ "trem_prefixo": "TR-204", "velocidade_media": 88.2, "velocidade_maxima": 104.0 }],
  "grafico": { "rotulo": "Velocidade média por trem", "itens": [{ "rotulo": "TR-204", "valor": 88.2 }] }
}
```

O front desenha tabela e gráfico só a partir de `colunas`, `linhas` e `grafico`. Uma linha por trem (ordenada por prefixo); trem sem dado no período não aparece. `grafico.itens` sai das mesmas `linhas`.

| `tipo` | Colunas (`chave`) | Gráfico |
|---|---|---|
| `desempenho` | `trem_prefixo`, `velocidade_media`, `velocidade_maxima` (leituras de sensor `velocidade`) | "Velocidade média por trem" |
| `consumo` | `trem_prefixo`, `consumo_total`, `consumo_medio` (soma e média das leituras de sensor `energia`) | "Consumo total por trem" |
| `eficiencia` | `trem_prefixo`, `concluidas`, `canceladas`, `atrasadas` (viagens com `partida_prevista` no período) | "Viagens concluídas por trem" |
| `manutencao` | `trem_prefixo`, `total_alertas`, `criticos`, `atencao`, `normais`, `ultima_inspecao` (alertas automáticos do período) | "Alertas por trem" |

### `GET /api/relatorios/csv`

Mesmos parâmetros. Devolve `text/csv; charset=utf-8` com BOM, cabeçalho = `rotulo` das colunas, e `Content-Disposition: attachment; filename=relatorio-{tipo}-{inicio}-{fim}.csv`. O front não faz `fetch`: o botão é um `<a download>` para `/api/relatorios/csv?...` (o cookie vai sozinho).

## Leituras (IoT)

- `POST /api/leituras` — **não usa cookie**: exige o header `X-API-Key` igual à env `SENSOR_API_KEY` (`401` `"Chave de sensor invalida"`). Corpo `{ "sensor_id": 3, "valor": 95.5 }`. `201` → `{ id, sensor_id, valor, status_operacional, data_hora, alerta_id }`. `409` se o sensor não existe.
- `GET /api/leituras/sensores` — mesma chave; lista `{ id, tipo_dado }` para o simulador (`python3 fsc.py sim`).
- `GET /api/leituras?sensor_id=&limite=` — `operacional` e `gestao` (cookie). `limite` 1–500 (padrão 50); mais recente primeiro; cada item traz `sensor_codigo` e `trem_prefixo`. Nenhuma tela consome este endpoint ainda (existe o hook `useLeituras`).

O `status_operacional` é derivado do valor pelos limites do tipo (`services/leituras.py`, E8 em [`../decisoes/fechamento-sa.md`](../decisoes/fechamento-sa.md)): acima do limite de atenção = `alerta`, acima do crítico = `falha`, senão `normal`; `localizacao` não tem limite (sempre `normal`). Leitura fora do normal cria um alerta automático (`alerta_id` na resposta) com `tipo` = tipo do sensor, `status` `"Atencao"`/`"Critico"` e `motivo` descritivo. O código não preenche a coluna `severidade` desse INSERT, então o alerta automático fica com o padrão do banco, `normal`.

## O que a API **não** cobre

- **Manutenções pendentes/finalizadas**: não existe tabela de manutenção. O relatório `manutencao` conta alertas automáticos por trem.
- **Ocupação de vagões/poltronas e passageiros**: o banco não tem capacidade de vagão nem passageiro. A tela de carga só consegue a lista de `carga` (histórico).
- **Foto de perfil**: só `foto_url` em leitura; não há upload.
- **Recuperar senha de verdade** (token + e-mail): stub; a redefinição é pelo administrador (`senha-temporaria`).
- **Apagar campo opcional**: `null` num `PATCH` significa "não mexe" em todos os recursos (SQL com `COALESCE`).
