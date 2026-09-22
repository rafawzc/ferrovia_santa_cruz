# Frontend — sistema de tema (claro/escuro)

> Complementa [`responsividade.md`](responsividade.md). Onde os tokens moram, a tabela de valores e o mapa dos nomes antigos: [`tema.md`](tema.md). Desde a fase 2 (2026-09-22) os nomes são os do shadcn/ui; esta página guarda a regra semântica e o histórico.

## Como funciona

`ThemeContext` (`src/contexts/ThemeContext.tsx`) guarda o tema em `localStorage` e aplica a classe `white` ou `black` na tag `<html>`. O `src/index.css` define os tokens no `:root` (claro) e sobrescreve no `.black` (escuro). Trocar de tema é só trocar a classe do `<html>` — nenhum componente sabe em qual tema está.

## A regra semântica dos tokens

Tokens são papéis, e o papel não muda entre os temas:

- **`primary`** (antigo `componente1`) é a cor de destaque/CTA (botões primários, dock, header de modal, tabs ativas).
- **`primary-foreground`** (antigo `texto2`) é *só* o texto/ícone pousado **direto** em `primary`.
- **`foreground`** (antigo `texto1`) é o texto padrão de qualquer outra superfície. Claro no escuro, escuro no claro — o papel é o mesmo.
- **`secondary`** / **`accent`** (antigos `componente3`/`componente4`) são superfícies neutras e pareiam com `secondary-foreground`/`accent-foreground` (= `foreground`).

Regra prática: **cada fundo `bg-X` usa o texto `text-X-foreground`.** Os pares foram verificados com contraste WCAG (≥ 4.5:1) nos dois temas.

## Histórico: opacidade em cor via CSS variable

No Tailwind 3 (até 2026-09-22) o modificador de opacidade (`/60`) só funcionava com a variável declarada como tripla RGB (`68 49 43`) e referenciada como `rgb(var(--x) / <alpha-value>)`. Em 2026-07, ao introduzir o tema escuro, tokens viraram `var(--x)` sem essa técnica e ~70 usos de `/opacidade` viraram texto preto, silenciosamente. No Tailwind v4 o alpha sai via `color-mix()` sobre a cor final, então a fase 2 aposentou os canais RGB: token é hex direto. O que ainda quebra em silêncio: token no `@theme inline` apontando pra variável que não existe (a cor some). Token novo sempre nos dois lugares (ver [`tema.md`](tema.md)).

## Ajuste de paleta

Valores em `src/index.css`. Qualquer ajuste de cor deve ser verificado com cálculo de contraste (relative luminance / WCAG), não "no olho" — o bug de 2026-07 só foi pego rodando a página de verdade. A vitrine `/ui` mostra todos os tokens lado a lado pra conferir os dois temas.
