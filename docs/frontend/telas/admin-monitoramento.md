# Telas admin — Dashboard, Rotas, Alertas

Três telas da equipe (`operacional` e `gestao`). Contrato: [`../../backend/api.md`](../../backend/api.md). Hooks: [`../dados-e-rotas.md`](../dados-e-rotas.md). Estados comuns: carregando (`Skeleton`), erro (`ErroDeCarregamento`) e vazio (texto).

| Rota | Arquivo | Endpoints |
|---|---|---|
| `/admin` | `pages/admin/Dashboard.tsx` | `GET /api/dashboard` |
| `/admin/rotas` | `pages/admin/Rotas.tsx` | `/api/linhas`, `/api/viagens`, `GET /api/trens` |
| `/admin/alertas` | `pages/admin/Alertas.tsx` | `GET /api/linhas`, `/api/alertas` |

## Dashboard (`/admin`)

- **Três indicadores** (`CartaoDeMetrica`): Viagens em andamento, Velocidade média (km/h, sem casas decimais) e Sensores críticos (bolinha vermelha se > 0, verde se 0).
- **Dois gráficos** (`GraficoDeBarras`): "Trens por status" (barras na cor padrão) e "Alertas ativos por severidade" (normal verde, atenção amarelo, crítico vermelho).
- **O que o usuário vê depende do papel**, porque a API devolve `null` onde a pergunta não se aplica: título "Dashboard do seu trem" para `operacional`, "Dashboard" para `gestao`. `velocidade_media` e `sensores_criticos` `null` viram o texto "Sem dados" (o de sensores sem bolinha); as listas `null` viram o gráfico vazio ("Sem dados para o gráfico."). É o caso do `operacional` sem trem vinculado ([API, Dashboard](../../backend/api.md#dashboard)). Lista `[]` (trem sem alerta) cai no mesmo texto do gráfico vazio.
- **Saiu (sem dado no banco):** manutenções pendentes/finalizadas, botão e modal "Cadastrar Manutenção", cadastro de horário, grade de sensores individuais e velocidade por rota. A lista de rotas com status está em `/admin/rotas`.

## Rotas (`/admin/rotas`)

Duas abas (`Tabs`): **Rotas** e **Viagens**. Escrita (cadastrar, editar, excluir) só para `gestao`; `operacional` só lê, e os botões nem aparecem (`podeEscrever`).

- **Aba Rotas** (`GET /api/linhas`): no celular, cards (número, `SeloDeStatus`, trajeto `origem → destino`, "Inativa"); a partir de `md`, tabela. Cadastro e edição num `Dialog`: número, origem, destino, status, ativa. `409` no salvar → "Já existe uma rota com este número" no campo número. Excluir pede confirmação (`AlertDialog`); `409` → toast "Esta rota tem viagens programadas e não pode ser excluída." (a API só diz "Registro em uso por outro cadastro"; a frase é da tela, que sabe que o vínculo é com viagem).
- **Aba Viagens** (`GET /api/viagens` com filtros de status, rota, trem e dia, enviados à API): a lista é o `ListaDeViagens`, com a coluna de ações só para `gestao`. "Programar viagem" abre um `Dialog` com rota, trem (`GET /api/trens`), partida, chegada e status. Validação do formulário: chegada depois da partida (a API não confere).
- **Fuso das viagens:** o `datetime-local` mostra e recebe horário local; a tela converte da API (UTC sem fuso) para local ao abrir a edição e de local para UTC sem fuso (`toISOString` cortado em 19 caracteres) ao salvar. Na lista, `dataHora()` converte de volta.
- **Saiu:** o "Mapa de Rotas". Era uma foto genérica de banco de imagens com o título de mapa; não há dado geográfico no schema, e mostrar aquilo como mapa seria dado falso. O mapa é tela opcional do Guia (`uniformizacao-telas.md` §4).

## Alertas (`/admin/alertas`)

Título "Alertas e Notificações". Duas colunas no desktop; no celular, o formulário vem primeiro e a central embaixo.

- **Novo alerta** (`POST /api/alertas`; react-hook-form + zod com as regras do contrato): Rota (select de `GET /api/linhas`, manda `linha_id`), Tipo (1–40), Severidade (normal, atenção, crítico), Tempo de espera (opcional), Motivo (1–200) e Status (1–40, **texto livre**: o banco guarda `VARCHAR`, não é o ENUM de `linha.status`, por isso não usa `SeloDeStatus`). Sucesso: toast "Alerta enviado" e o formulário limpa. `409` → mensagem no campo Rota pedindo pra recarregar; `422` → "Valor inválido" no campo do `loc`.
- **Central de alertas** (`GET /api/alertas`, filtros enviados à API): severidade, tipo (igualdade exata, não busca parcial) e situação. A situação começa em **Não tratados**; as outras são Tratados e Todos.
- **Cada alerta**: origem ("Rota 2645", ou "<tipo> (sensor)" para o automático, que não tem rota), selo de severidade, tipo, status, motivo, tempo de espera e hora. O botão "Marcar como tratado" / "Reabrir" faz `PATCH /api/alertas/{id}`; tratado fica esmaecido e alerta crítico não tratado ganha borda vermelha.
- **Data:** `criado_em` vem sem fuso, em UTC. A tela usa `dataHora()` de `src/lib/utils.ts`, que acrescenta `Z` antes do `new Date`; sem isso a hora sai deslocada pelo fuso.

## Componente: `ErroDeCarregamento`

`components/ui/erro-de-carregamento.tsx`: `ErroDeCarregamento` (parágrafo `role="alert"` pro estado de erro de uma query) e `mensagemDeErro(error)` (`detail` da API quando é `ApiError`, "Sem conexão com o servidor" quando é falha de rede). Usado por todas as telas logadas.

## Vocabulário (L1)

Texto das telas diz **Rota** ("Rota 1778"), inclusive o `CartaoDeLinha`.
