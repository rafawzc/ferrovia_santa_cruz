# Telas admin — Dashboard, Rotas, Alertas

Três telas da equipe (`operacional` e `gestao`). Contrato: [`../../backend/api.md`](../../backend/api.md). Hooks: [`../dados-e-rotas.md`](../dados-e-rotas.md). Composição recomposta em 2026-11-09 sob [`../principios-de-ui.md`](../principios-de-ui.md); rotas, papéis e contrato de API ficaram intactos.

| Rota | Arquivo | Endpoints |
|---|---|---|
| `/admin` | `pages/admin/Dashboard.tsx` | `GET /api/dashboard` |
| `/admin/rotas` | `pages/admin/Rotas.tsx` | `/api/linhas`, `/api/viagens`, `GET /api/trens` |
| `/admin/alertas` | `pages/admin/Alertas.tsx` | `GET /api/linhas`, `/api/alertas` |

Estados comuns das três: carregando com `Skeleton` na forma do conteúdo, erro com `ErroDeCarregamento` + `refetch`, e vazio com cartão centrado (ícone, frase e botão que resolve).

## Dashboard (`/admin`)

- **Três indicadores** (`CartaoDeMetrica`), nesta ordem: **Viagens em andamento**, **Sensores críticos** e **Velocidade média** (km/h, sem casas decimais). Sensores críticos leva um `SeloDeStatus` ao lado do rótulo — "Crítico" quando > 0, "Normal" quando 0. A bolinha de cor saiu (estado nunca é só cor).
- **Dois gráficos** (`GraficoDeBarras`), nesta ordem: "Alertas ativos por severidade" (normal/atenção/crítico nas cores de status) e "Trens por status" (barras na cor padrão). Cada um dentro de um `Card` com título.
- **O que o usuário vê depende do papel**, porque a API devolve `null` onde a pergunta não se aplica: título "Dashboard do seu trem" para `operacional` (com a linha de apoio "Números do trem vinculado à sua conta.") e "Dashboard" para `gestao`. `velocidade_media` e `sensores_criticos` `null` viram o texto "Sem dados" (o de sensores, sem selo); as listas `null` viram o gráfico vazio ("Sem dados para o gráfico."). É o caso do `operacional` sem trem vinculado ([API, Dashboard](../../backend/api.md#dashboard)). Lista `[]` (trem sem alerta) cai no mesmo texto do gráfico vazio.
- **Saiu (sem dado no banco):** manutenções pendentes/finalizadas, botão e modal "Cadastrar Manutenção", cadastro de horário, grade de sensores individuais e velocidade por rota. A lista de rotas com status está em `/admin/rotas`.

## Rotas (`/admin/rotas`)

Cabeçalho "Rotas" com apoio "Malha ferroviária e viagens programadas." e duas abas (`Tabs`): **Rotas** e **Viagens**. Escrita (cadastrar, editar, excluir) só para `gestao`; `operacional` só lê, e os botões nem aparecem (`podeEscrever`).

- **Aba Rotas** (`GET /api/linhas`): abaixo de `md`, cartões (rótulo "Rota" + número em destaque, dois selos à direita, trajeto `origem → destino`); de `md` pra cima, tabela com Rota, Origem, Destino, Status, **Situação** e Ações. A situação ativa/inativa é **selo** (`ativo`/`inativo`), não mais o texto "Ativa: Sim/Não" nem a palavra "Inativa" solta.
- **Cadastro e edição** num `Dialog` ("Cadastrar rota" / "Editar rota {numero}"): número, origem e destino (os dois lado a lado no `sm`), status (`Select` com os selos) e um `Switch` "Rota ativa na malha". `409` no salvar → "Já existe uma rota com este número" no campo número.
- **Excluir** pede confirmação (`AlertDialog` "Excluir a rota {numero}?", botão "Excluir rota"); `409` → toast "Esta rota tem viagens programadas e não pode ser excluída." (a API só diz "Registro em uso por outro cadastro"; a frase é da tela, que sabe que o vínculo é com viagem).
- **Aba Viagens** (`GET /api/viagens` com filtros de status, rota, trem e dia, enviados à API): botão "Programar viagem" acima dos filtros (largura cheia no celular, à direita no `sm`), filtros em 1/2/4 colunas, e a lista é o `ListaDeViagens`, com a coluna de ações só para `gestao`. O `Dialog` tem rota, trem (`GET /api/trens`), partida, chegada e status; o formulário exige chegada depois da partida (a API não confere). Excluir viagem sugere, no texto do `AlertDialog`, marcar como cancelada para manter o histórico.
- **Vazios distintos:** "Nenhuma rota cadastrada" (ação: cadastrar a primeira, só pra `gestao`) e "Nenhuma viagem encontrada" (texto fala em trocar o filtro).
- **Ações por linha** são dois botões de ícone `ghost` com `aria-label` ("Editar rota 1778", "Excluir rota 1778") e `Tooltip`.
- **Fuso das viagens:** o `datetime-local` mostra e recebe horário local; a tela converte da API (UTC sem fuso) para local ao abrir a edição e de local para UTC sem fuso (`toISOString` cortado em 19 caracteres) ao salvar. Na lista, `dataHora()` converte de volta.
- **Saiu:** o "Mapa de Rotas". Era uma foto genérica de banco de imagens com o título de mapa; não há dado geográfico no schema, e mostrar aquilo como mapa seria dado falso. O mapa é tela opcional do Guia (`uniformizacao-telas.md` §4).

## Alertas (`/admin/alertas`)

Título "Alertas e Notificações", apoio "Ocorrências da operação, da mais recente para a mais antiga.", e o botão **"Novo alerta"** nas ações do cabeçalho. **Não há mais coluna fixa de formulário**: o cadastro virou `Dialog` sobre a lista, e a central de alertas ocupa a tela inteira nos dois tamanhos (cartões também no desktop — alerta é texto corrido, não cabe em célula).

- **Novo alerta** (`Dialog` → `POST /api/alertas`; react-hook-form + zod com as regras do contrato): Rota (select de `GET /api/linhas`, manda `linha_id`), Severidade (normal, atenção, crítico), Tipo (1–40), Motivo (1–200), Status (1–40, **texto livre**: o banco guarda `VARCHAR`, não é o ENUM de `linha.status`, por isso não usa `SeloDeStatus`) e Tempo de espera (opcional). Sucesso: toast "Alerta enviado" e o diálogo fecha. `409` → mensagem no campo Rota pedindo pra recarregar; `422` → "Valor inválido" no campo do `loc`. Se `GET /api/linhas` falhar, o select fica desabilitado e um texto `role="alert"` diz pra fechar e abrir de novo.
- **Filtros** (enviados à API, 3 colunas no `sm`): severidade, tipo (igualdade exata, não busca parcial) e situação. A situação começa em **Não tratados**; as outras são Tratados e Todos.
- **Cada alerta** é um `Card`: selo de severidade no topo (mais um `Badge` "Tratado" quando for o caso), origem como `h2` ("Rota 2645", ou "<tipo> (sensor)" para o automático, que não tem rota), hora à direita, e Motivo/Tipo/Status/Tempo de espera numa `dl`. O botão fecha o cartão: "Marcar como tratado" (`default`) ou "Reabrir alerta" (`outline`) → `PATCH /api/alertas/{id}`. Alerta crítico não tratado ganha borda `danger`; alerta tratado **não** é mais esmaecido (opacidade não é rótulo) — ele se distingue pelo `Badge` e pelo botão.
- **Vazio:** "Nenhum alerta encontrado" com botão "Limpar filtros" (que leva a situação para "Todos").
- **Data:** `criado_em` vem sem fuso, em UTC. A tela usa `dataHora()` de `src/lib/utils.ts`, que acrescenta `Z` antes do `new Date`; sem isso a hora sai deslocada pelo fuso.

## Componente: `ErroDeCarregamento`

`components/ui/erro-de-carregamento.tsx`: `ErroDeCarregamento` (cartão `role="alert"` com ícone, mensagem e "Tentar de novo") e `mensagemDeErro(error)` (`detail` da API quando é `ApiError`, "Sem conexão com o servidor" quando é falha de rede). Usado por todas as telas logadas — sempre com `aoTentarDeNovo={() => void refetch()}`, que refaz só a query; sem a prop o botão recarrega o documento.

## Vocabulário (L1)

Texto das telas diz **Rota** ("Rota 1778").

Observação: a aba Rotas monta o cartão dela própria, porque precisa das ações de editar/excluir por item. O composto `CartaoDeLinha`, que só a vitrine usava, foi removido em 2026-11-09.
