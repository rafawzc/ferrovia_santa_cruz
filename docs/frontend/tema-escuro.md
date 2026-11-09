# Frontend — sistema de tema (claro/escuro)

> Complementa [`responsividade.md`](responsividade.md). Onde os tokens moram, a tabela de valores e o mapa dos nomes antigos: [`tema.md`](tema.md). O *porquê* da paleta e os contrastes medidos: [`principios-de-ui.md`](principios-de-ui.md). Esta página guarda a regra semântica e o histórico.

## Como funciona

O contexto de tema (`src/contexts/Tema.tsx`) guarda o tema em `localStorage` e aplica a classe `claro` ou `escuro` na tag `<html>`. O `src/index.css` define os tokens no `:root` (claro) e sobrescreve no `.escuro`. Trocar de tema é só trocar a classe do `<html>` — nenhum componente sabe em qual tema está.

## A regra semântica dos tokens

Tokens são papéis, e o papel não muda entre os temas — **o valor muda**. Desde 2026-11-09 isso vale até para os status.

- **`primary`** é a ação principal e a navegação ativa. No claro é o marrom `#6d412a`; no escuro a ação vira o dourado `#c4a27d`. Quem escreve tela não precisa saber disso: usa `bg-primary text-primary-foreground`.
- **`primary-foreground`** é *só* o texto/ícone pousado **direto** em `primary`.
- **`foreground`** é a tinta padrão de qualquer outra superfície. Claro no escuro, escuro no claro — o papel é o mesmo.
- **`secondary`** / **`accent`** são superfícies neutras e pareiam com `secondary-foreground`/`accent-foreground`. `accent` é o realce (hover de navegação, item selecionado), `secondary` é a superfície elevada e o selo neutro.
- **`popover`** é a superfície de camada flutuante (diálogo, folha, select aberto, toast). Camada em `bg-background` é erro: ela precisa se separar do fundo da página.

Regra prática: **cada fundo `bg-X` usa o texto `text-X-foreground`.** Os pares foram verificados com contraste WCAG (≥ 4.5:1 em texto, ≥ 3:1 em borda com significado) nos dois temas.

### Dois pares que existem só por causa de contraste

| Par | Quando usar cada um |
|---|---|
| `border` × `border-forte` | `border` é divisória decorativa entre superfícies de luminância parecida (cartão, linha de tabela, borda de camada). `border-forte` é contorno de **controle** — campo, select, switch, botão `outline` — e é o único que passa 3:1, porque ali a borda carrega significado (diz onde se digita). |
| `danger` × `danger-ink` | `danger` é **preenchimento** (selo, ícone em círculo, banner de erro). Como texto ele não atinge 4.5:1 sobre `card` no tema claro, então texto de erro usa `danger-ink`. No escuro os dois têm o mesmo valor. |

`destructive` existe porque os primitivos shadcn esperam esse nome; ele carrega o mesmo hex de `danger` nos dois temas, por cópia — mudou um, mude o outro.

### Status nunca é só cor

Status aparece como **selo preenchido com rótulo** (`SeloDeStatus`), nunca como texto colorido nem ponto de cor. Dois motivos, nesta ordem: nenhum tom de status atinge 4.5:1 como texto sobre `card`, e no papel o `@media print` apaga a cor — só o rótulo sobrevive. Booleano `ativo` da API também vira selo (`ativo`/`inativo`), não "Sim/Não".

## Histórico: opacidade em cor via CSS variable

No Tailwind 3 (até 2026-09-22) o modificador de opacidade (`/60`) só funcionava com a variável declarada como tripla RGB (`68 49 43`) e referenciada como `rgb(var(--x) / <alpha-value>)`. Em 2026-07, ao introduzir o tema escuro, tokens viraram `var(--x)` sem essa técnica e ~70 usos de `/opacidade` viraram texto preto, silenciosamente. No Tailwind v4 o alpha sai via `color-mix()` sobre a cor final, então a fase 2 aposentou os canais RGB: token é hex direto. O que ainda quebra em silêncio: token no `@theme inline` apontando pra variável que não existe (a cor some). Token novo sempre nos dois lugares (ver [`tema.md`](tema.md)).

## Histórico: paleta refeita em 2026-11-09

A paleta anterior tinha um fundo (`#d5c4a8`) que não estava no guia de estilo, `border: #ffffff`, `input: #ffffff99` e status de biblioteca (`#dc2626`, `#eab308`, `#15803d`) iguais nos dois temas. Resultado: borda invisível, campo sem contorno e vermelho/amarelo brigando com o sépia. O refactor trocou tudo pelos valores medidos de [`principios-de-ui.md`](principios-de-ui.md) e passou a redeclarar o `.escuro` por inteiro. Decisão e porquê: [`../decisoes/frontend-e-qualidade.md`](../decisoes/frontend-e-qualidade.md) (F7).

## Ajuste de paleta

Valores em `src/index.css`. Qualquer ajuste de cor deve ser verificado com cálculo de contraste (relative luminance / WCAG), não "no olho" — o bug de 2026-07 só foi pego rodando a página de verdade. Depois do ajuste, abra `/ui` (com sessão: a vitrine monta a `CascaDePagina`, que não renderiza sem usuário) e as telas em 390px e 1440px nos dois temas (critério da seção 8 de [`principios-de-ui.md`](principios-de-ui.md)).
