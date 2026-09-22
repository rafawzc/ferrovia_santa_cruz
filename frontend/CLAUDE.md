# frontend/ — React 19 + Vite + Tailwind v4

## Rodar npm (só container)

Nunca rode `node`/`npm` do host. Use `./fsc npm <args>` da raiz do repo. Sem o `./fsc`, o equivalente cru é:

```bash
docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD/frontend:/app" -w /app node:24-slim npm <args>
```

O `-u` com o UID do host é obrigatório: `frontend/` é bind mount e `node_modules`/`package-lock.json` precisam ficar com o seu dono (senão viram root).

Gate do front: `npm run typecheck`, `npm run lint`, `npm run build`. Não tem teste de front.

## Tailwind v4: config mora no CSS

Não existe `tailwind.config.js` nem `postcss.config.js`. O plugin é `@tailwindcss/vite` (em `vite.config.ts`) e os tokens estão no `@theme` de `src/index.css`. Token novo = variável `--color-*`/`--font-*` no `@theme`, não arquivo JS. Detalhe dos tokens e do tema escuro: `src/theme/CLAUDE.md`.

- Estilo global próprio vai dentro de `@layer base`. CSS **fora de layer** ganha de qualquer utilitário (as utilities do v4 vivem em `@layer utilities`), então um `* { padding: 0 }` solto zera todo `p-*`.
- Não existe variante `dark:` ligada ao `data-theme`. Hoje nenhuma tela usa `dark:` (o tema troca pelas variáveis). Se precisar, declarar `@custom-variant dark (&:where([data-theme=dark], [data-theme=dark] *));` no `index.css`.
- Renomes do v3→v4 já aplicados nas telas: `shadow-sm`→`shadow-xs`, `rounded`→`rounded-sm`, `aspect-[4/3]`→`aspect-4/3`.

## TypeScript

`tsconfig.json` é strict e só cobre `src/**/*.ts`, `src/**/*.tsx` e `vite.config.ts`. As telas `.jsx` antigas ficam fora do typecheck até serem reescritas em TSX (fase 4). Alias `@/*` → `src/*` configurado nos dois lugares: `tsconfig.json` (`paths`) e `vite.config.ts` (`resolve.alias`). Mudou um, mude o outro.

## Dev server

`vite.config.ts`: `server.host: true` (escuta fora do container), porta 5173, proxy `/api` → `http://backend:8000`. Rodando o container avulso (fora do compose) o proxy dá 502 — o nome `backend` só existe na rede do compose.
