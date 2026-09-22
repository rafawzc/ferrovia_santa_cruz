# Frontend — Sistema de temas (claro/escuro)

> O sistema de tema em uso é o do time (PR #13): `ThemeContext` + tokens `texto*`/`componente*`/`bg-*`. A regra semântica dos tokens, a paleta e o histórico de bugs de contraste estão em [`tema-escuro.md`](tema-escuro.md). Este arquivo cobre **onde os tokens moram no Tailwind v4** e o que muda na fase 2.
>
> Histórico: a issue #14 chegou a ter um sistema paralelo (`src/theme/` com `data-theme` e tokens `bg`/`surface`/`primary`), descartado no merge da `main` em 2026-09-22 em favor do sistema do time. Spec antiga: [`../tasks/lowh-sistema-de-temas-2026-07-06.md`](../tasks/lowh-sistema-de-temas-2026-07-06.md).

## Como funciona (deadly simple)

```
ThemeContext  →  <html class="white">  →  .white define --texto1: 68 49 43       →  text-texto1 = rgb(68 49 43)
              →  <html class="black">  →  .black define --texto1: 247 242 238    →  text-texto1 = rgb(247 242 238)
```

- `src/contexts/ThemeContext.jsx` guarda `isDark` no `localStorage` (`theme` = `light`/`dark`) e põe a classe `white` ou `black` no `<html>`. `useTheme()` devolve `{ isDark, toggleTheme }`; o botão é `components/ThemeToggle`.
- `index.html` já nasce com `class="white"`. Não tem script anti-FOUC: quem salvou `dark` vê um instante do claro até o React montar.

## Onde os tokens moram (Tailwind v4)

Tudo em `frontend/src/index.css`, não existe `tailwind.config.js`:

```css
@theme {
  --color-texto1: rgb(var(--texto1));
}

.white { --texto1: 68 49 43; }
.black { --texto1: 247 242 238; }
```

- **`@theme`** registra o token pro Tailwind gerar as classes (`text-texto1`, `bg-componente1`, `bg-bg-page`…). O valor é `rgb(var(--canal))`: aponta pras variáveis de canal RGB que `.white`/`.black` trocam.
- **Opacidade** (`text-texto1/60`) funciona: no v4 o Tailwind aplica alpha com `color-mix()` sobre a cor final, não precisa mais do `<alpha-value>` do v3. Os canais RGB separados por espaço ficaram só porque é o formato que `.white`/`.black` já usam.
- **Nunca** escreva `--color-x: rgb(var(--color-x))` (autorreferência = variável inválida = cor some). O nome do token no `@theme` (`--color-*`) e o do canal (`--texto1`) têm que ser diferentes.
- `input-bg` e `overlay` são `rgba(...)` prontos (`--color-input-bg: var(--input-bg)`). `error`/`success` são hex fixos, iguais nos dois temas.
- Não existe variante `dark:` (nenhuma tela usa). Se precisar: `@custom-variant dark (&:where(.black, .black *));` no `index.css`.
- Token novo: canal em `.white` **e** `.black`, e `--color-<nome>: rgb(var(--<nome>));` no `@theme`.

> **Vai mudar na fase 2:** os nomes serão trocados pro **vocabulário do shadcn/ui** (`--background`, `--foreground`, `--card`, `--primary`, `--muted`, `--accent`, `--border`, `--input`, `--ring`, `--radius`…), com a mesma paleta mapeada neles, mais tokens de status (`success`, `warning`, `danger`) — L10 do plano [`../tasks/lowh-fundacao-design-system-2026-09-22.md`](../tasks/lowh-fundacao-design-system-2026-09-22.md).

## Pendente

- Anti-FOUC (tema escuro salvo pisca claro no carregamento).
- Renome pro vocabulário shadcn e tokens de status (fase 2). Hoje há cor de paleta Tailwind solta nas telas `.jsx` (ex.: `bg-yellow-500` em `CargaLista`), fora do lint até a reescrita em TSX.
