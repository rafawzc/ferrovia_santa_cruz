# Frontend — responsividade (mobile-first)

> Referenciado pelo `.claude/CLAUDE.md` (P1 *Mobile-first* + seção Frontend). O site tem que funcionar igual de bem em desktop e mobile — é requisito da SA, não enfeite.

## Princípio: mobile-first

Comece desenhando/codando o layout **mobile**, depois suba pros breakpoints maiores. Nunca "faço desktop e depois adapto pro celular" — adaptar pra baixo sempre quebra. Cada tela é testada nos dois antes de declarar pronta.

O design vem do usuário em **imagens separadas (mobile e desktop)** — siga as imagens, não invente layout. Quando houver tokens/sistema de design definido, consuma os tokens, não chumbe valores soltos.

## Consumo de API

Chamadas à API sempre por **caminho relativo** `/api/...` — o proxy do Vite resolve pro backend pela rede interna. Nunca URL absoluta (`http://localhost:8000`). Detalhe do porquê em [`../arquitetura/containers-e-rede.md`](../arquitetura/containers-e-rede.md).

## Padrões responsivos comuns

Catálogo de como elementos pesados se reorganizam no mobile. Preencher com os padrões reais conforme as telas forem nascendo — por ora, os comuns pra um app de dashboard + informação:

| Elemento | Desktop | Mobile |
|----------|---------|--------|
| **Sidebar de navegação** | fixa lateral | vira drawer sob demanda (hambúrguer no header) — sem strip de ícones permanente |
| **Tabela de dados** (ex: horários, trens) | tabela normal | `<thead>` escondido; cada linha vira card empilhado com labels inline |
| **Cards de dashboard / KPIs** | grid de várias colunas | empilham em 1 coluna; números grandes encolhem |
| **Filtros / ações** | inline na barra | colapsam em menu/bottom-sheet |

## Dois lados, duas experiências

- **Admin** — gerenciamento + informação (dashboard, CRUDs, métricas).
- **Cliente** — informação (consulta de horários, trens, estações).

Pense nas rotas e nos guards de acesso desde cedo: o que é público (cliente) vs. o que exige login (admin). Os dois lados são responsivos.

## Testes

**Não há teste de front** (decisão de 2026-09-22, [`../decisoes/frontend-e-qualidade.md`](../decisoes/frontend-e-qualidade.md) F5 — substitui o Vitest + Testing Library planejado antes). O gate do front é `./fsc check` (typecheck + lint + build). Toda tela se verifica **à mão no navegador**, em mobile E desktop, antes de ser dada como pronta.
