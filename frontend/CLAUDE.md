# frontend/ — React 19 + Vite + Tailwind v4

## Rodar npm (só container)

Nunca rode `node`/`npm` do host. Use `./fsc npm <args>` da raiz do repo. Sem o `./fsc`, o equivalente cru é:

```bash
docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD/frontend:/app" -w /app node:24-slim npm <args>
```

O `-u` com o UID do host é obrigatório: `frontend/` é bind mount e `node_modules`/`package-lock.json` precisam ficar com o seu dono (senão viram root).

Gate do front: `./fsc lint fe`, `./fsc typecheck`, `./fsc npm run format:check`, `./fsc npm run build`. Não tem teste de front (L27). Formatar: `./fsc npm run format` (ou `./fsc fmt`, que formata front + back).

## Tailwind v4: config mora no CSS

Não existe `tailwind.config.js` nem `postcss.config.js`. O plugin é `@tailwindcss/vite` (em `vite.config.ts`) e os tokens estão no `@theme` de `src/index.css`. Token novo = variável `--color-*`/`--font-*` no `@theme`, não arquivo JS. Tokens (`texto*`, `componente*`, `bg-*`…) são `rgb(var(--canal))` no `@theme`; `.white`/`.black` no `<html>` (posto pelo `contexts/ThemeContext.jsx`) trocam os canais. Detalhe: `docs/frontend/tema.md` e `docs/frontend/tema-escuro.md` (regra semântica `componente1`→`texto2`).

- Estilo global próprio vai dentro de `@layer base`. CSS **fora de layer** ganha de qualquer utilitário (as utilities do v4 vivem em `@layer utilities`), então um `* { padding: 0 }` solto zera todo `p-*`.
- Não existe variante `dark:`. Hoje nenhuma tela usa `dark:` (o tema troca pelas variáveis). Se precisar, declarar `@custom-variant dark (&:where(.black, .black *));` no `index.css`.
- Nunca `--color-x: rgb(var(--color-x))` no `@theme`: autorreferência invalida a cor. Nome do token e do canal têm que diferir.
- Renomes do v3→v4 já aplicados nas telas: `shadow-sm`→`shadow-xs`, `rounded`→`rounded-sm`, `outline-none`→`outline-hidden`, `aspect-[4/3]`→`aspect-4/3`. Código novo vindo da `main` com classe v3 precisa do mesmo renome.

## TypeScript

Pinado em `~6.0.x`: o `typescript-eslint` exige `typescript >=4.8.4 <6.1.0`; TS 7 quebra o lint type-aware. Só sobe quando o peer range do `typescript-eslint` aceitar.

`tsconfig.json` é strict e só cobre `src/**/*.ts`, `src/**/*.tsx` e `vite.config.ts`. As telas `.jsx` antigas ficam fora do typecheck até serem reescritas em TSX (fase 4). Alias `@/*` → `src/*` configurado nos dois lugares: `tsconfig.json` (`paths`) e `vite.config.ts` (`resolve.alias`). Mudou um, mude o outro.

## Dev server

`vite.config.ts`: `server.host: true` (escuta fora do container), porta 5173, proxy `/api` → `http://backend:8000`. Rodando o container avulso (fora do compose) o proxy dá 502 — o nome `backend` só existe na rede do compose.

## Lint e format

ESLint 9 flat (`eslint.config.js`) — 9 e não 10 porque o `eslint-plugin-jsx-a11y` só aceita até `^9`. Base: `typescript-eslint` `strictTypeChecked` (type-aware via `projectService`), `react-hooks` recommended, `jsx-a11y` recommended, `react-refresh` (vite), `eslint-config-prettier` por último. Prettier com `prettier-plugin-tailwindcss` (ordena classes; lê o `@theme` de `src/index.css` via `tailwindStylesheet`).

Escopo: só `**/*.{ts,tsx}` + `eslint.config.js` + `eslint-rules/`. **Os `.jsx` legados de `src/` estão ignorados** até serem reescritos em TSX na fase 4 — tela reescrita passa a ser linted automaticamente.

| Regra                             | Proíbe                                                                                                         | Exceção                                                                 |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `local/no-comments` (L7)          | qualquer comentário; tem autofix que apaga                                                                     | `eslint-disable*`/`eslint-enable`, `@ts-expect-error`, `/// <reference` |
| `local/no-raw-color` (L13a)       | hex, `rgb/hsl/oklch/oklab(`, classe de paleta (`bg-red-500`, `text-white/50`) em qualquer string               | nenhuma (vale em `ui/` também); cor mora só no `src/index.css`          |
| `local/no-arbitrary-value` (L13d) | valor arbitrário Tailwind (`rounded-[3rem]`, `[&_svg]:…`)                                                      | `src/components/ui/**` (shadcn usa `has-[>svg]:`), desligado no config  |
| `no-restricted-syntax` (L13b/d)   | `<button/input/select/textarea/dialog>` cru; atributo `style`                                                  | controles crus liberados em `src/components/ui/**`; `style` sem exceção |
| `no-restricted-globals` (L13c)    | `fetch`                                                                                                        | `src/lib/api/**`                                                        |
| `no-restricted-imports` (L13c)    | páginas importando `@radix-ui/*`, `@/pages/*` ou qualquer import relativo (use `@/`); `ui/` importando páginas | —                                                                       |

As regras locais são um plugin ESM em `eslint-rules/index.js`. As de string olham `Literal` e quasis de template e quebram por espaço — não sabem se a string é className, então um texto tipo `"[opcional]"` também cai no `no-arbitrary-value`.

`./fsc ui add <comp>` roda `eslint --fix src/components/ui` depois do CLI do shadcn: é o autofix do `no-comments` que tira os comentários gerados (R6). O fix deixa linha em branco/espaço sobrando; o Prettier limpa.
