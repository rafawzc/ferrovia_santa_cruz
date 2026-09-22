# frontend/ — React 19 + Vite + Tailwind v4

## Rodar npm (só container)

Nunca rode `node`/`npm` do host. Use `./fsc npm <args>` da raiz do repo. Sem o `./fsc`, o equivalente cru é:

```bash
docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD/frontend:/app" -w /app node:24-slim npm <args>
```

O `-u` com o UID do host é obrigatório: `frontend/` é bind mount e `node_modules`/`package-lock.json` precisam ficar com o seu dono (senão viram root).

Gate do front: `./fsc lint fe`, `./fsc typecheck`, `./fsc npm run format:check`, `./fsc npm run build`. Não tem teste de front (L27). Formatar: `./fsc npm run format` (ou `./fsc fmt`, que formata front + back).

## Tailwind v4: config mora no CSS

Não existe `tailwind.config.js` nem `postcss.config.js`. O plugin é `@tailwindcss/vite` (em `vite.config.ts`) e os tokens estão em `src/index.css`: vocabulário shadcn (`background`, `primary`, `muted`…) + `overlay` + status (`success warning danger delay`), valor em hex no `:root` (claro) e `.black` (escuro), exposto pro Tailwind no `@theme inline` (`--color-x: var(--x)`). O `contexts/ThemeContext.tsx` põe `white`/`black` no `<html>`. Token novo = valor no `:root` (+ `.black` se muda) + linha no `@theme inline`. Detalhe e mapa dos nomes antigos: `docs/frontend/tema.md`.

- Estilo global próprio vai dentro de `@layer base`. CSS **fora de layer** ganha de qualquer utilitário (as utilities do v4 vivem em `@layer utilities`), então um `* { padding: 0 }` solto zera todo `p-*`.
- `dark:` existe (`@custom-variant dark` casando `.black`), porque os primitivos shadcn usam. Em código próprio prefira token.
- O `@theme inline` aponta pra variável: se o nome não existir no `:root`, a cor some sem erro.
- Renomes do v3→v4 já aplicados nas telas: `shadow-sm`→`shadow-xs`, `rounded`→`rounded-sm`, `outline-none`→`outline-hidden`, `aspect-[4/3]`→`aspect-4/3`. Código novo vindo da `main` com classe v3 precisa do mesmo renome.

## Design system

Tudo que desenha está em `src/components/ui/` (ler o `CLAUDE.md` de lá). Vitrine em `/ui` (`src/pages/Vitrine.tsx`). `components.json` configura o CLI do shadcn (`new-york`, aliases `@/components/ui` e `@/lib/utils`); `cn()` fica em `src/lib/utils.ts` (clsx + tailwind-merge). Não há mais componente fora de `ui/` (o legado `.jsx` saiu na fase 4).

## Camada de dados, auth e rotas

Fluxo de uma tela: **página → hook de `src/hooks/<recurso>.ts` → `api.<recurso>` de `src/lib/api` → `fetch('/api/...')`**. Página nunca chama `fetch` (lint barra fora de `src/lib/api/**`) nem `api.*` direto: usa o hook.

```tsx
import { toast } from 'sonner'
import { LoadError, mensagemDeErro } from '@/components/ui/load-error'
import { useCriarCarga } from '@/hooks/cargas'
import { useLinhas } from '@/hooks/linhas'
import { marcarErrosDeCampo } from '@/lib/api'

const { data: linhas, isPending, error } = useLinhas()
const criar = useCriarCarga()
if (error) return <LoadError error={error} />
criar.mutate(dados, {
  onSuccess: () => toast.success('Carga cadastrada'),
  onError: (e) => {
    if (marcarErrosDeCampo(e, form)) return
    toast.error(mensagemDeErro(e))
  },
})
```

- **Hooks** (`src/hooks/`): um módulo por recurso, sem fábrica genérica. Chave = nome do recurso (`['cargas']`, `['usuarios', id]`); mutação invalida a chave do recurso. `usuarios.ts` também invalida `['me']` (a gestão pode editar a si mesma).
- **Erro**: tudo que a API recusa vira `ApiError` (`status`, `body.detail`; `message` = `detail` quando é string). Falha de rede chega como `TypeError`, não `ApiError`. Helpers únicos, não reescreva na página:
  - `422` (lista `loc`/`type`) → `if (marcarErrosDeCampo(erro, form)) return` (`@/lib/api`): marca "Valor inválido" em cada campo do `loc` que existe no form.
  - Estado de erro de query → `<LoadError error={error} />`; texto de toast → `mensagemDeErro(erro)` (os dois de `@/components/ui/load-error`).
  - `criado_em` vem sem fuso e em UTC → `dataHora(iso)` de `@/lib/utils` (soma `Z` antes do `new Date`).
- **Retry**: queries só repetem erro que não é `ApiError` (rede); 4xx/5xx da API falham na hora.
- **401 global**: `src/lib/query-client.ts` escuta erro de qualquer query/mutação; `401` zera `['me']` → o guard manda pro `/login`. Tela não trata 401.
- **Sessão**: `contexts/AuthContext.tsx` → `useAuth()` dá `usuario` (`Usuario | null`), `carregando`, e as mutações `login`/`logout` (objetos do TanStack: `login.mutate(creds)`, `login.isPending`, `login.error`). `me` com `401` vira `null`, não erro. Login grava `['me']` direto; logout zera `['me']` e remove o resto do cache.
- **Pós-login**: a tela de login só chama `login.mutate`. Quem navega é o `PublicLayout`: com usuário, manda pra `state.de` (URL que o guard guardou) ou pro início do papel (`cliente` → `/perfil`, resto → `/admin`).
- **Rotas** (`src/App.tsx`, layout routes do react-router 7): `PublicLayout` (login/cadastro/recuperar), `ProtectedLayout` (exige sessão, envolve `PageShell` + `Suspense`), `Papeis` (papel errado → início do papel). Tabela completa em `docs/frontend/dados-e-rotas.md`. Rota nova: `lazy(() => import(...))` + `<Route>` dentro do grupo de papel certo + item no `NAV` do `page-shell.tsx` (com `papeis`).
- **Raiz** (`main.tsx`): `QueryClientProvider` → `ThemeProvider` → `AuthProvider` → `TooltipProvider` → `App` + `Toaster`. Tela não monta `Toaster` nem `TooltipProvider`.
- **Formulário de cadastro/edição** abre em `Dialog` sobre a lista (carga, usuários), não em rota própria.
- **Tela logada não monta `PageShell`**: o `ProtectedLayout` já envolve.

## TypeScript

Pinado em `~6.0.x`: o `typescript-eslint` exige `typescript >=4.8.4 <6.1.0`; TS 7 quebra o lint type-aware. Só sobe quando o peer range do `typescript-eslint` aceitar.

`tsconfig.json` é strict e cobre `src/**/*.ts`, `src/**/*.tsx` e `vite.config.ts` — ou seja, todo o `src/` (não existe mais `.js`/`.jsx` lá; arquivo novo é `.ts`/`.tsx`, sem `allowJs`). Alias `@/*` → `src/*` configurado nos dois lugares: `tsconfig.json` (`paths`) e `vite.config.ts` (`resolve.alias`). Mudou um, mude o outro.

## Dev server

`vite.config.ts`: `server.host: true` (escuta fora do container), porta 5173, proxy `/api` → `http://backend:8000`. Rodando o container avulso (fora do compose) o proxy dá 502 — o nome `backend` só existe na rede do compose.

## Lint e format

ESLint 9 flat (`eslint.config.js`) — 9 e não 10 porque o `eslint-plugin-jsx-a11y` só aceita até `^9`. Base: `typescript-eslint` `strictTypeChecked` (type-aware via `projectService`), `react-hooks` recommended, `jsx-a11y` recommended, `react-refresh` (vite), `eslint-config-prettier` por último. Prettier com `prettier-plugin-tailwindcss` (ordena classes; lê o `@theme` de `src/index.css` via `tailwindStylesheet`).

Escopo: `**/*.{ts,tsx}` + `eslint.config.js` + `eslint-rules/`, sem ignore em `src/` — lint cobre tudo.

| Regra                             | Proíbe                                                                                                                                           | Exceção                                                                 |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- |
| `local/no-comments` (L7)          | qualquer comentário; tem autofix que apaga                                                                                                       | `eslint-disable*`/`eslint-enable`, `@ts-expect-error`, `/// <reference` |
| `local/no-raw-color` (L13a)       | hex, `rgb/hsl/oklch/oklab(`, classe de paleta (`bg-red-500`, `text-white/50`) em qualquer string                                                 | nenhuma (vale em `ui/` também); cor mora só no `src/index.css`          |
| `local/no-arbitrary-value` (L13d) | valor arbitrário Tailwind (`rounded-[3rem]`, `[&_svg]:…`)                                                                                        | `src/components/ui/**` (shadcn usa `has-[>svg]:`), desligado no config  |
| `no-restricted-syntax` (L13b/d)   | `<button/input/select/textarea/dialog>` cru; atributo `style`                                                                                    | controles crus liberados em `src/components/ui/**`; `style` sem exceção |
| `no-restricted-globals` (L13c)    | `fetch`                                                                                                                                          | `src/lib/api/**`                                                        |
| `no-restricted-imports` (L13c)    | páginas importando `radix-ui`/`@radix-ui/*`, `@/pages/*` ou qualquer import relativo (use `@/`); `ui/` importando páginas, `cn` ou `next-themes` | —                                                                       |

As regras locais são um plugin ESM em `eslint-rules/index.js`. As de string olham `Literal` e quasis de template e quebram por espaço — não sabem se a string é className, então um texto tipo `"[opcional]"` também cai no `no-arbitrary-value`.

`./fsc ui add <comp>` roda `eslint --fix src/components/ui` depois do CLI do shadcn: é o autofix do `no-comments` que tira os comentários gerados (R6). O fix deixa linha em branco/espaço sobrando; o Prettier limpa.
