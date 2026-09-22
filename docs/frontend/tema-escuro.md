# Frontend — sistema de tema (claro/escuro)

> Complementa [`responsividade.md`](responsividade.md). Cobre os tokens de cor e a troca de tema — leia antes de mexer em cores, `index.css` ou `tailwind.config.js`.

## Como funciona

`ThemeContext` (`src/contexts/ThemeContext.jsx`) guarda o tema em `localStorage` e aplica a classe `white` ou `black` na tag `<html>`. Cada classe define um conjunto de CSS custom properties em `src/index.css`, e `tailwind.config.js` mapeia as classes utilitárias (`text-texto1`, `bg-componente1`, etc.) pra essas variáveis. Trocar de tema é só trocar a classe do `<html>` — nenhum componente sabe em qual tema está.

## A regra semântica dos tokens

Os tokens não são "cor clara" / "cor escura" — são papéis, e o papel de cada um não muda entre os temas:

- **`componente1`** é a cor de destaque/CTA (botões primários, header de modal, toasts, tabs ativas). Em ambos os temas ela funciona como uma superfície "acentuada" que precisa de texto claro em cima.
- **`texto2`** é *exclusivamente* o texto/ícone que fica **diretamente** sobre `componente1`. Nada mais usa `texto2`.
- **`texto1`** é o texto padrão pra qualquer outra superfície (página, `bg-card`, `componente3`, `componente4`). No tema claro ele é escuro; no tema escuro ele é claro — mas o *papel* (texto padrão) não muda.
- **`componente3`** / **`componente4`** são superfícies neutras (chips, cards aninhados, tabs inativas) — sempre pareiam com `texto1`.

Regra prática: **se o elemento está pousado direto em `bg-componente1`, o texto é `texto2`. Em qualquer outra superfície, é `texto1`.** Essa regra vale igual nos dois temas — foi verificada com contraste WCAG (`ratio ≥ 4.5:1`) pros dois lados antes de fechar a paleta escura.

## Gotcha: opacidade (`/60`, `/40`, etc.) em cor via CSS variable

Os tokens são CSS custom properties (pra poder trocar de valor por tema). Tailwind só consegue aplicar o modificador de opacidade (`text-texto1/60`) numa cor-variável se ela for declarada como **tripla RGB sem função** (`68 49 43`) e referenciada no `tailwind.config.js` como `rgb(var(--texto1) / <alpha-value>)`. Se a variável for um hex direto (`#44312b`) ou já vier embrulhada (`var(--texto1)` puro), o Tailwind não consegue injetar o alpha — a classe gera **nenhuma regra CSS válida**, e o elemento cai pro preto padrão do browser (`rgb(0,0,0)`), **silenciosamente**, sem erro de build nem de lint.

Isso já mordeu o projeto uma vez: ao introduzir o tema escuro, alguém trocou os tokens de hex-fixo pra `var(--x)` sem essa técnica, e todo uso de `/opacidade` nesses tokens (~70 ocorrências) virou texto preto. No tema claro isso quase não se notava (preto sólido parece com "texto escuro em opacidade" a olho nu); no tema escuro ficou óbvio (texto devia ser quase-branco e saía preto).

**Se for adicionar um token novo que precisa suportar `/opacidade`:** declare em `index.css` como tripla RGB (`--novo-token: 12 34 56;`) e em `tailwind.config.js` como `'rgb(var(--novo-token) / <alpha-value>)'`. `--input-bg` e `--overlay` são exceção — já são `rgba(...)` prontos e nunca são usados com sufixo `/NN`, então ficam como estão.

## Paleta atual

Valores em `src/index.css` (`.white` / `.black`). Qualquer ajuste de cor deve ser verificado com um cálculo de contraste (relative luminance / WCAG), não só "olhando" — o bug de 2026-07 (`text-texto2` trocado por `text-texto1` em massa, e `componente1`/`bg-base`/`bg-card` colapsados na mesma cor no escuro) só foi pego rodando a página de verdade, não lendo o diff.
