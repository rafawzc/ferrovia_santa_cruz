# src/theme/ — Sistema de temas (claro/escuro)

Camada que faz o app inteiro trocar de tema sem cada componente saber disso.

## Como funciona (o pulo do gato)

Cada cor do app é um **token semântico por PAPEL** (`bg`, `surface`, `primary`, `text`, `on-primary`…), não por valor. O token é uma CSS variable `--color-*` declarada no `@theme` de `src/index.css` (Tailwind v4, config em CSS):

- `@theme { --color-bg: #c4a27d; ... }` → tema **claro** (= paleta base da SA). O Tailwind emite essas vars em `:root` e gera `bg-bg`, `text-text` etc. apontando pra `var(--color-*)`.
- `[data-theme="dark"] { --color-bg: #241a14; ... }` → tema **escuro** (marrom, sem preto puro). Sobrescreve as mesmas vars.

**Trocar `data-theme` no `<html>` re-pinta tudo** — nenhum componente tem lógica de tema.

> **Gotchas:**
>
> - O bloco `[data-theme="dark"]` fica **fora** de `@layer`: o `@theme` vira `@layer theme`, e CSS sem layer sempre ganha de CSS em layer. É isso que garante que o escuro sobrescreve o claro, sem depender de especificidade (`:root` e `[data-theme]` empatam).
> - Valores são cor direta (hex). Opacidade (`bg-primary/90`) funciona porque o v4 gera `color-mix(in oklab, var(--color-primary) 90%, transparent)`. A regra antiga de "canais RGB separados por espaço" era do v3 e morreu.
> - `--color-primary` escuro (`#9a5f38`) foi afinado pra dar AA (4.5:1) com `on-primary`. Não clareie/escureça sem medir contraste.

## Peças

- **`ThemeProvider.jsx`** — Provider + hook `useTheme()`.
  - `getInitialTheme()`: 1ª visita respeita `prefers-color-scheme`; depois manda o que estiver no `localStorage['theme']`.
  - `useTheme()` retorna `{ theme, toggleTheme }`. Um `useEffect` escreve `data-theme` no `<html>` e persiste no `localStorage` a cada mudança.
  - Provider fica no topo em `src/main.jsx`, envolvendo `<App/>`.
- **Script anti-FOUC** (em `index.html`, no `<head>`) — seta `data-theme` ANTES do React montar, senão o app pisca o tema errado no load. Ele duplica a lógica de `getInitialTheme` de propósito (roda antes do bundle). **Se mudar a regra de decisão do tema, mude nos DOIS lugares.**
- **Toggle** — na página `Perfil` (`src/pages/Perfil.jsx`), reusa o componente `Toggle` ligado a `toggleTheme`.

## Mapa dos tokens (papel → onde usar)

| Token               | Papel                                                         | Classe                                         |
| ------------------- | ------------------------------------------------------------- | ---------------------------------------------- |
| `bg`                | fundo de página                                               | `bg-bg`                                        |
| `surface`           | card/input taupe, secundário                                  | `bg-surface`                                   |
| `surface-2`         | superfície elevada mais clara                                 | `bg-surface-2`                                 |
| `primary`           | ação primária / card escuro / nav / Modal                     | `bg-primary`, `text-primary`, `border-primary` |
| `on-primary`        | tinta SOBRE `primary`/superfície escura                       | `text-on-primary`                              |
| `text`              | tinta principal (sobre fundo claro no claro, clara no escuro) | `text-text`                                    |
| `text-muted`        | tinta secundária                                              | `text-text-muted`                              |
| `panel`             | painel decorativo escuro (lateral do auth desktop)            | `bg-panel`                                     |
| `field`             | fundo de input                                                | `bg-field`                                     |
| `border`            | hairline / focus ring                                         | `border-border`, `ring-primary`                |
| `error` / `success` | validação (hex fixo, fora do tema)                            | idem                                           |

Cores de **status** (verde/amarelo/vermelho/laranja em `StatusBadge`, `UserCard`, `LineCard`) são paleta Tailwind pura de propósito — são sinais universais, não cor de marca.

## Regra de ouro ao criar tela nova

Escolha o token pelo **papel**, não pela cor. Texto sobre fundo escuro (`bg-primary`) = `text-on-primary`. Texto sobre fundo claro = `text-text`. Componente que vive nos dois contextos (ex: `FormField`) recebe um prop `onDark` pra decidir a cor da tinta que fica sobre o container — o input em si é uma pílula clara autossuficiente. Nunca chumbe hex nem use `componente1`/`texto1` (não existem mais).
