# components/ui/ — o design system inteiro

Primitivos shadcn **e** compostos do domínio moram juntos aqui (L11). Página só compõe o que está aqui. Catálogo e passo a passo de tela: `docs/frontend/design-system.md`. Tokens: `docs/frontend/tema.md`.

## Adicionar primitivo shadcn

```bash
./fsc ui add <nome> [-y]      # da raiz do repo; roda o CLI e depois eslint --fix aqui (tira comentários)
./fsc npm run format          # limpa as linhas em branco que o fix deixa
./fsc lint fe                 # tem que passar
```

Depois do add, conserte na mão o que o lint pegar. Os casos já vistos:

- **`import { cn } from "cn"`**: o registry do shadcn passou a gerar isso (pacote npm `cn`, 2026-09) e instala a dep `cn`. Troque por `@/lib/utils` (`sed -i 's#from "cn"#from "@/lib/utils"#' src/components/ui/*.tsx`) e `./fsc npm uninstall cn`. O lint barra `cn` e `next-themes` aqui.
- `bg-black/50` do overlay → `bg-overlay`. `text-white` → `text-<cor>-foreground`.
- `style={}` é proibido até aqui: `progress` virou `<progress>` nativo; o `sonner` passa as vars em classe arbitrária (`[--normal-bg:var(--popover)]`) e lê o tema de `@/contexts/ThemeContext` (não existe `next-themes`).
- `"use client"` sai (não tem RSC).

## Regras

- Só token (`bg-primary`, `text-muted-foreground`…). Cor crua é erro de lint até aqui. Valor arbitrário (`rounded-t-[3rem]`, `has-[>svg]:`) é liberado só nesta pasta.
- Ajuste de marca é por **variante cva** ou pelo token, nunca classe solta na página. Ex.: `Button` tem `success`; `Badge` tem `success warning danger delay`.
- `react-refresh/only-export-components` está desligado aqui (shadcn exporta `buttonVariants` junto do componente).
- `ui/` não importa páginas. Pode importar `@/contexts/*` e `react-router-dom`.
- Arquivo em kebab-case (`status-badge.tsx`), export nomeado.

## Compostos do domínio

`page-shell` (layout logado + dock; a lista de rotas do dock mora ali, cada item com os `papeis` que o veem — filtrado pelo `useAuth`), `auth-layout`, `screen-header`, `status-badge` (mapa status do banco → rótulo/variante; tipo `Status`), `metric-card`, `line-card`, `user-card`, `theme-toggle`, `password-input`. `TooltipProvider` e `Toaster` são montados uma vez no `main.tsx`; não monte de novo.

Tudo novo aparece na vitrine `src/pages/Vitrine.tsx` (rota `/ui`) — adicione lá quando criar componente ou variante.
