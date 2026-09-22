# Telas admin — Dashboard, Rotas, Alertas

Fase 4 (L17, L28). Três telas da equipe (`operacional` e `gestao`), reescritas em TSX sobre o design system e a API real. Contrato: [`../../backend/api.md`](../../backend/api.md). Hooks: [`../dados-e-rotas.md`](../dados-e-rotas.md).

| Rota | Arquivo | Hooks | Endpoints |
|---|---|---|---|
| `/admin` | `pages/admin/Dashboard.tsx` | `useDashboard`, `useLinhas` | `GET /api/dashboard`, `GET /api/linhas` |
| `/admin/rotas` | `pages/admin/Rotas.tsx` | `useLinhas` | `GET /api/linhas` |
| `/admin/alertas` | `pages/admin/Alertas.tsx` | `useLinhas`, `useAlertas`, `useCriarAlerta` | `GET /api/linhas`, `GET/POST /api/alertas` |

Todas têm os três estados: carregando (`Skeleton`), erro (`LoadError`) e vazio (texto). Rótulo e cor do status da rota vêm do `StatusBadge` (L7).

## Dashboard (`/admin`)

- **Quatro indicadores** (`MetricCard`): Rotas ativas (`linhas_ativas`), Em manutenção (`linhas_em_manutencao`; bolinha amarela se > 0, verde se 0), Sensores (`sensores`), Velocidade média (`velocidade_media` em km/h; "Sem leitura" quando vem `null`).
- **Status das rotas**: lista de `GET /api/linhas` com número, `StatusBadge` e "(inativa)" quando `ativo` é falso.
- **Saiu (L28, sem dado no banco):** manutenções pendentes/finalizadas, botão e modal "Cadastrar Manutenção", cadastro de horário, grade de sensores individuais e velocidade por rota. Voltam quando houver tabela + endpoint.

## Rotas (`/admin/rotas`)

- Grade de `LineCard` (2 colunas no celular, 3 no tablet, 4 no desktop), igual ao mockup — são só 3 campos por rota, então fica card também no desktop em vez de tabela.
- **Saiu:** o "Mapa de Rotas". Era uma foto genérica de banco de imagens (link externo) com o título de mapa; não há dado geográfico no schema, então mostrar aquilo como mapa das rotas seria dado falso. O mapa é tela opcional do Guia (`uniformizacao-telas.md` §4).

## Alertas (`/admin/alertas`)

- **Formulário** (react-hook-form + zod, regras do contrato): Rota (select de `GET /api/linhas`, manda `linha_id`), Tempo de espera (opcional, até 40), Motivo (1–200), Status (1–40, **texto livre** — o banco guarda `VARCHAR`, não é o ENUM de `linha.status`, por isso não usa `StatusBadge`).
- Sucesso → toast "Alerta enviado", formulário limpa e o histórico recarrega (a mutação invalida `['alertas']`).
- `409` (rota apagada entre carregar a lista e enviar) → mensagem no campo Rota pedindo pra recarregar. `422` → "Valor inválido" no campo apontado por `loc` (`marcarErrosDeCampo` de `@/lib/api`). Outro erro → toast com o `detail` da API (ou "Sem conexão com o servidor").
- **Histórico** ("Alertas enviados"): todos os alertas de `GET /api/alertas`, mais recente primeiro, em cards (celular: embaixo do formulário; desktop: coluna ao lado, como no mockup). O legado só mostrava os últimos 30 min da sessão local; agora é o histórico do banco.
- **Data:** `criado_em` vem sem fuso e está em UTC (horário do MySQL no container). A tela usa `dataHora()` de `src/lib/utils.ts`, que acrescenta `Z` antes do `new Date` pra converter pro horário local; sem isso a hora sai adiantada/atrasada pelo fuso.

## Componente novo: `LoadError`

`components/ui/load-error.tsx`: `LoadError` (parágrafo `role="alert"` pro estado de erro de uma query) e `mensagemDeErro(error)` (`detail` da API quando é `ApiError`, "Sem conexão com o servidor" quando é falha de rede — o `TypeError` do `fetch` vem em inglês). Usado por todas as telas logadas (erro de carregamento e texto dos toasts de erro) e mostrado na vitrine `/ui`.

## Vocabulário (L1)

Texto das telas diz **Rota** ("Rota 1778", "Rotas ativas"), inclusive o `LineCard` ("Rota {numero}").
