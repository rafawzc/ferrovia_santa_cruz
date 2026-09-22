# Frontend — Sistema de temas (claro/escuro)

> Tokens no **vocabulário do shadcn/ui** desde a fase 2 (2026-09-22, L10 do plano [`../tasks/lowh-fundacao-design-system-2026-09-22.md`](../tasks/lowh-fundacao-design-system-2026-09-22.md)). Catálogo de componentes e como montar tela: [`design-system.md`](design-system.md). Regra de contraste e histórico de bugs: [`tema-escuro.md`](tema-escuro.md).

## Como funciona (deadly simple)

```
ThemeContext  →  <html class="white">  →  :root   define --primary: #6d412a   →  bg-primary = #6d412a
              →  <html class="black">  →  .black  redefine --primary: #885030 →  bg-primary = #885030
```

- `src/contexts/ThemeContext.tsx` guarda o tema no `localStorage` (`theme` = `light`/`dark`) e põe `white` ou `black` no `<html>`. `useTheme()` devolve `{ isDark, toggleTheme }`. O botão novo é `ThemeToggle` de `@/components/ui/theme-toggle`.
- `index.html` já nasce com `class="white"`. Sem anti-FOUC: quem salvou `dark` vê um instante do claro até o React montar.

## Onde os tokens moram

Tudo em `frontend/src/index.css`:

```css
@custom-variant dark (&:where(.black, .black *));

@theme inline {
  --color-primary: var(--primary);
}

:root  { --primary: #6d412a; }
.black { --primary: #885030; }
```

- **`:root`** tem o tema claro (vale mesmo sem classe); **`.black`** sobrescreve só o que muda no escuro. Status (`success`/`warning`/`danger`/`delay`) e `destructive` são iguais nos dois temas, por isso só aparecem no `:root`.
- **`@theme inline`** faz o Tailwind gerar `bg-primary`, `text-muted-foreground`… apontando direto pra variável. Cor definida direto em hex (com alpha em hex8 quando precisa, ex. `--input: #ffffff99`). **Não existe mais o truque de canais RGB.**
- **Opacidade** (`bg-primary/20`) funciona: o v4 aplica alpha com `color-mix()` na cor final.
- **`dark:`** existe e casa com `.black` (os primitivos do shadcn usam). Em código novo prefira token que já muda de valor sozinho; `dark:` é só pra exceção.
- **Radius:** `--radius: 1rem`. `rounded-lg` = 16px, `rounded-xl` = 20px, `rounded-md` = 14px, `rounded-sm` = 12px.
- **Fonte:** `--font-poppins` (`font-poppins`); o `body` já usa Poppins.
- **Token novo:** valor em `:root` (e em `.black` se muda no escuro) + `--color-<nome>: var(--<nome>);` no `@theme inline`.

## Tokens

| Token | Papel | Claro | Escuro |
|-------|-------|-------|--------|
| `background` / `foreground` | fundo da página / texto padrão | `#d5c4a8` / `#44312b` | `#130f0c` / `#f7f2ee` |
| `card` / `card-foreground` | superfície de card | `#c2b19c` / `#44312b` | `#3a2f27` / `#f7f2ee` |
| `popover` / `popover-foreground` | menus, select aberto, toast | `#daccbe` / `#44312b` | `#6e5949` / `#f7f2ee` |
| `primary` / `primary-foreground` | marca, CTA, dock, header de modal | `#6d412a` / `#eae6de` | `#885030` / `#eae6de` |
| `secondary` / `secondary-foreground` | chips, tabs inativas, cards aninhados | `#c2b19c` / `#44312b` | `#514338` / `#f7f2ee` |
| `muted` / `muted-foreground` | fundo das telas de auth (Componente 2) / texto secundário | `#c4a27d` / `#57412f` | `#251d18` / `#c9b29c` |
| `accent` / `accent-foreground` | hover, cards de métrica | `#daccbe` / `#44312b` | `#6e5949` / `#f7f2ee` |
| `destructive` / `destructive-foreground` | ação destrutiva, erro de campo | `#dc2626` / `#ffffff` | igual |
| `border` | bordas | `#ffffff` | `#c9b29c` |
| `input` | fundo dos campos (pílula) | `#ffffff99` | `#00000059` |
| `ring` | foco | `#6d412a` | `#c9b29c` |
| `overlay` | fundo atrás de modal/sheet | `#00000080` | `#000000b3` |
| `success` / `-foreground` | status normal (verde) | `#15803d` / `#ffffff` | igual |
| `warning` / `-foreground` | status atenção (amarelo) | `#eab308` / `#44312b` | igual |
| `danger` / `-foreground` | status crítico (vermelho) | `#dc2626` / `#ffffff` | igual |
| `delay` / `-foreground` | atraso de linha (laranja) | `#c2410c` / `#ffffff` | igual |

Status seguem [`../decisoes/uniformizacao-telas.md`](../decisoes/uniformizacao-telas.md) L6/L7 (cor fixa, nunca tingida com a marca). Pares texto/fundo checados com contraste WCAG ≥ 4.5 (exceção: `ring` escuro é 3:1+, suficiente pra indicador de foco).

## De → para (codemod da fase 2)

Os `.jsx` legados foram migrados por codemod com esse mapa, mantendo o visual. O papel de cada token antigo virou o token shadcn equivalente:

| Antigo | Novo | Observação |
|--------|------|------------|
| `texto1` | `foreground` | `text-texto1` → `text-foreground` |
| `texto2` | `primary-foreground` | texto sobre a cor de marca |
| `componente1` | `primary` | também `ring` (foco) |
| `componente3` | `secondary` | |
| `componente4` | `accent` | também `popover` |
| `bg-base` | `muted` | `bg-bg-base` → `bg-muted` |
| `bg-page` | `background` | `bg-bg-page` → `bg-background` |
| `bg-card` | `card` | `bg-bg-card` → `bg-card` |
| `input-bg` | `input` | `bg-input-bg` → `bg-input` |
| `overlay` | `overlay` | agora hex8, igual papel |
| `border` | `border` | igual |
| `error` | `destructive` | `text-error` → `text-destructive` |
| `success` | `success` | hex mudou de `#16a34a` pra `#15803d` (contraste com texto branco) |
| `yellow-400/500/600` soltos | `warning` | |
| `orange-400` solto | `delay` | |
| `red-400` (status) | `danger` | |
| `red-400/500/50` (botão sair) | `destructive` (`/10` no hover) | |
| `green-400` / `green-100/300/700` | `success` (`/15`, `/40` nos tons claros) | |

## Pendente

- Anti-FOUC (tema escuro salvo pisca claro no carregamento).
