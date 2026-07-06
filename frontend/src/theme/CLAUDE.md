# src/theme/ — Sistema de temas (claro/escuro)

Camada que faz o app inteiro trocar de tema sem cada componente saber disso.

## Como funciona (o pulo do gato)

Cada cor do app é um **token semântico por PAPEL** (`bg`, `surface`, `primary`, `text`, `on-primary`…), não por valor. O token é uma **CSS variable** definida em `src/index.css`:

- `:root { --color-bg: 196 162 125; ... }` → tema **claro** (= paleta base da SA).
- `[data-theme="dark"] { --color-bg: 36 26 20; ... }` → tema **escuro** (marrom, sem preto puro).

O `tailwind.config.js` mapeia cada cor Tailwind pra `rgb(var(--color-x) / <alpha-value>)`. Então `bg-primary`, `text-text`, `bg-surface/50` etc. resolvem pro valor do tema ativo. **Trocar `data-theme` no `<html>` re-pinta tudo** — nenhum componente tem lógica de tema.

> **Gotcha (não quebre isso):** as CSS vars são **canais RGB separados por espaço** (`"154 95 56"`), NÃO hex. É o que faz o modificador de opacidade do Tailwind (`bg-primary/90`, `text-text/60`) funcionar — vira `rgb(var(--color-primary) / .9)`. Se você trocar por hex (`#9a5f38`), TODA classe com `/opacidade` quebra silenciosamente.

## Peças

- **`ThemeProvider.jsx`** — Provider + hook `useTheme()`.
  - `getInitialTheme()`: 1ª visita respeita `prefers-color-scheme`; depois manda o que estiver no `localStorage['theme']`.
  - `useTheme()` retorna `{ theme, toggleTheme }`. Um `useEffect` escreve `data-theme` no `<html>` e persiste no `localStorage` a cada mudança.
  - Provider fica no topo em `src/main.jsx`, envolvendo `<App/>`.
- **Script anti-FOUC** (em `index.html`, no `<head>`) — seta `data-theme` ANTES do React montar, senão o app pisca o tema errado no load. Ele duplica a lógica de `getInitialTheme` de propósito (roda antes do bundle). **Se mudar a regra de decisão do tema, mude nos DOIS lugares.**
- **Toggle** — na página `Perfil` (`src/pages/Perfil.jsx`), reusa o componente `Toggle` ligado a `toggleTheme`.

## Mapa dos tokens (papel → onde usar)

| Token | Papel | Classe |
|-------|-------|--------|
| `bg` | fundo de página | `bg-bg` |
| `surface` | card/input taupe, secundário | `bg-surface` |
| `surface-2` | superfície elevada mais clara | `bg-surface-2` |
| `primary` | ação primária / card escuro / nav / Modal | `bg-primary`, `text-primary`, `border-primary` |
| `on-primary` | tinta SOBRE `primary`/superfície escura | `text-on-primary` |
| `text` | tinta principal (sobre fundo claro no claro, clara no escuro) | `text-text` |
| `text-muted` | tinta secundária | `text-text-muted` |
| `panel` | painel decorativo escuro (lateral do auth desktop) | `bg-panel` |
| `field` | fundo de input | `bg-field` |
| `border` | hairline / focus ring | `border-border`, `ring-primary` |
| `error` / `success` | validação (hex fixo, fora do tema) | idem |

Cores de **status** (verde/amarelo/vermelho/laranja em `StatusBadge`, `UserCard`, `LineCard`) são paleta Tailwind pura de propósito — são sinais universais, não cor de marca.

## Regra de ouro ao criar tela nova

Escolha o token pelo **papel**, não pela cor. Texto sobre fundo escuro (`bg-primary`) = `text-on-primary`. Texto sobre fundo claro = `text-text`. Componente que vive nos dois contextos (ex: `FormField`) recebe um prop `onDark` pra decidir a cor da tinta que fica sobre o container — o input em si é uma pílula clara autossuficiente. Nunca chumbe hex nem use `componente1`/`texto1` (não existem mais).
