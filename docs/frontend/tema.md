# Frontend — Sistema de temas (claro/escuro)

> Origem: issue #14 ("Refatoramento do sistema de temas"). Spec de decisão: [`../tasks/lowh-sistema-de-temas-2026-07-06.md`](../tasks/lowh-sistema-de-temas-2026-07-06.md). Conhecimento procedural pro próximo agente: [`../../frontend/src/theme/CLAUDE.md`](../../frontend/src/theme/CLAUDE.md).

## O que é

O app tem **dois temas**: claro (a paleta base da SA) e escuro (marrom escuro, sem preto puro). O usuário troca no **Perfil** (`/perfil`), a escolha **persiste** entre sessões, e na primeira visita o app respeita o tema do sistema operacional (`prefers-color-scheme`).

## A ideia central (deadly simple)

Antes, cada cor era um hex chumbado no Tailwind (`componente1: '#6d412a'`). Não dava pra ter tema — cor fixa é cor fixa. Além disso os nomes eram por **valor** (`componente1`, `texto1`), então ninguém sabia se um token era "botão" ou "fundo" — e o mesmo token era usado pras duas coisas, gerando bugs de contraste (texto escuro em fundo escuro).

Agora as cores são **tokens semânticos por papel** (`bg`, `surface`, `primary`, `text`, `on-primary`…), cada um uma **CSS variable**. Existe um jogo de valores pro claro e outro pro escuro. Trocar um atributo (`data-theme`) no `<html>` re-pinta o app inteiro. Nenhum componente tem código de tema — eles só usam o token do papel certo.

```
<html data-theme="light">   →   :root define os valores claros   →   bg-primary = #6d412a
<html data-theme="dark">    →   [data-theme=dark] sobrescreve   →   bg-primary = #9a5f38
```

## Onde os tokens moram (Tailwind v4, desde 2026-09-22)

Tudo em `frontend/src/index.css` — não existe mais `tailwind.config.js`:

```css
@theme {
  --color-bg: #c4a27d;
  --color-primary: #6d412a;
}

[data-theme='dark'] {
  --color-bg: #241a14;
  --color-primary: #9a5f38;
}
```

- **`@theme`** declara os tokens do tema **claro**. O Tailwind v4 lê isso e gera as classes (`bg-bg`, `text-primary`…) apontando pra `var(--color-*)`.
- **`[data-theme='dark']`** sobrescreve as mesmas variáveis no escuro. Fica **fora** de `@layer` de propósito: CSS sem layer ganha de CSS em layer, então o escuro sempre vence o claro.
- **Cor direta (hex)**. O truque antigo de "canais RGB separados por espaço" (`--color-bg: 196 162 125`) era exigência do Tailwind 3 pra opacidade funcionar. No v4 a opacidade (`bg-primary/90`) sai via `color-mix`, então morreu.
- Cor só existe nesse arquivo: o lint (`local/no-raw-color`) barra hex, `rgb(` e classe de paleta (`bg-red-500`) em qualquer outro lugar. Decisão em [`../decisoes/frontend-e-qualidade.md`](../decisoes/frontend-e-qualidade.md).

> **Vai mudar na fase 2:** os nomes dos tokens serão trocados pro **vocabulário do shadcn/ui** (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--accent`, `--border`, `--input`, `--ring`, `--radius`…), com a mesma paleta marrom/bege mapeada neles, mais tokens de status (`success`, `warning`, `danger`) — L10 do plano [`../tasks/lowh-fundacao-design-system-2026-09-22.md`](../tasks/lowh-fundacao-design-system-2026-09-22.md). A mecânica (`data-theme` + anti-FOUC) fica igual. A tabela abaixo descreve os nomes **de hoje**.

## Paleta

| Token (papel) | Claro | Escuro |
|---------------|-------|--------|
| `bg` fundo de página | `#c4a27d` | `#241a14` |
| `surface` card/input | `#c2b19c` | `#33241b` |
| `surface-2` elevado | `#daccbe` | `#402f24` |
| `primary` ação/marca | `#6d412a` | `#9a5f38` |
| `on-primary` tinta sobre primary | `#eae6de` | `#f4efe8` |
| `text` tinta principal | `#44312b` | `#efe7dd` |
| `text-muted` tinta secundária | `#6b5245` | `#b7a493` |
| `panel` painel decorativo | `#44312b` | `#3a281d` |
| `field` fundo de input | `#ede4d7` | `#4a382c` |
| `border` hairline/ring | `#6d412a` | `#5a4636` |

No **claro** os valores são idênticos à paleta original — a migração não mudou nada visualmente. No **escuro** os valores foram derivados com marrom escuro e validados por contraste WCAG AA (texto principal 12–14:1, texto secundário 6–7:1, texto de botão ≥4.5:1).

## O que a issue #14 pediu e como ficou

1. **Tema escuro** — criado do zero (não existia). Paleta marrom, sem preto puro.
2. **Cores de fonte no claro** — corrigido o bug do label do `FormField` dentro de containers escuros (Modal/painéis de Dashboard, Carga, Alertas): agora usa tinta creme legível via prop `onDark`.
3. **Fundo do `<html>`** — agora segue o token `bg` do tema ativo (antes era um creme `#efe8de` chumbado, diferente do fundo das telas).
4. **Paleta escura** — marrom escuro nos fundos, tons mais claros nas superfícies, contraste AA.

## Como mexer

Detalhe procedural (tokens no `@theme`, por que o escuro fica fora de layer, anti-FOUC, regra ao criar tela) está em [`frontend/src/theme/CLAUDE.md`](../../frontend/src/theme/CLAUDE.md). **Leia antes de adicionar cor ou tela nova.**

## Pendente

- Afinar estética tela-a-tela no escuro (rodada 2) — esta entrega garante legível + sem regressão no claro, não "lindo em cada pixel" no escuro.
- Ajuste fino de tom das cores de status no escuro, se necessário.
- Renomear os tokens pro vocabulário shadcn e criar tokens de status (fase 2, L10). Hoje as cores de status ainda são classes de paleta Tailwind nas telas `.jsx` legadas, que estão fora do lint até serem reescritas em TSX.
