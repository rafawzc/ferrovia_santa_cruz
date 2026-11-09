# frontend/ — React 19 + Vite + Tailwind v4

## Rodar npm (só container)

Nunca rode `node`/`npm` do host. Use `python3 fsc.py npm <args>` da raiz do repo. Sem o `fsc.py`, o equivalente cru (Linux/macOS) é:

```bash
docker run --rm -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD/frontend:/app" -w /app node:24-slim npm <args>
```

O `-u` com o UID do host é obrigatório: `frontend/` é bind mount e `node_modules`/`package-lock.json` precisam ficar com o seu dono (senão viram root).

Gate do front: `python3 fsc.py lint fe`, `python3 fsc.py typecheck`, `python3 fsc.py npm run format:check`, `python3 fsc.py npm run build`. Não tem teste de front (L27). Formatar: `python3 fsc.py npm run format` (ou `python3 fsc.py fmt`, que formata front + back).

## Nomes em português

Todo identificador que **nós** escrevemos é em português: componente, arquivo, hook, variável, tipo, prop, campo de contexto (`Aplicacao`, `principal.tsx`, `CascaDePagina`, `useAutenticacao`, `clienteDeConsultas`, `requisitar`, `esquema`, `formulario`). Arquivo de `components/ui/` continua em kebab-case, só que em português (`casca-de-pagina.tsx`).

Fica em inglês o que é **contrato de terceiro** — mudar quebraria:

- API de lib: `useState`, `useQuery`, `data`, `error`, `isPending`, `mutate`, `onSuccess`, `onError`, `queryKey`, `handleSubmit`, `setError`, `children`, `className`.
- Prop de DOM/JSX: `name`, `value`, `onChange`, `onClick`, `type`, `id`, `placeholder`, `disabled`, `variant`, `size`.
- Primitivos shadcn vendored (`Button`, `Card`, `Dialog`, `Field*`…) e o helper `cn` de `lib/utils.ts`.
- String de URL (`/auth/login`), chave de payload da API (`senha_atual`, `cargo_id`) e nome de campo de formulário que vira essa chave.
- Sufixo `Props` em tipo de componente (`CampoTextoProps`) e `status` (termo do domínio e do HTTP).

**Prop nossa de callback usa prefixo `ao`, não `on`**: `aoFechar`, `aoSalvar`, `aoAbrir`, `aoErrar`. O `on` só sobrevive quando é prop do DOM repassada (`onClick` do `CartaoDeUsuario`).

## Tailwind v4: config mora no CSS

Não existe `tailwind.config.js` nem `postcss.config.js`. O plugin é `@tailwindcss/vite` (em `vite.config.ts`) e os tokens estão em `src/index.css`: vocabulário shadcn (`background`, `primary`, `muted`…) + `overlay` + `border-forte` + status (`success warning danger delay`, cada um com `-foreground`) + `danger-ink`, valor em hex no `:root` (claro) e `.escuro` (escuro), exposto pro Tailwind no `@theme inline` (`--color-x: var(--x)`). O `@theme inline` também traz a escala tipográfica (`text-rotulo` 13px, `text-corpo` 15px, `text-titulo` 28px, `text-destaque` 32px) e `--radius: 1.25rem`. O `contexts/Tema.tsx` põe `claro`/`escuro` no `<html>`. Token novo = valor no `:root` (+ `.escuro` se muda) + linha no `@theme inline`. Tabela de valores: `docs/frontend/tema.md`; o porquê de cada cor: `docs/frontend/principios-de-ui.md`.

- Estilo global próprio vai dentro de `@layer base` — é onde moram a transição global (150ms `ease-out`), o `body` (cor, fundo e Poppins), o anel de foco de `button:focus-visible` e o bloco `prefers-reduced-motion`. CSS **fora de layer** ganha de qualquer utilitário (as utilities do v4 vivem em `@layer utilities`), então um `* { padding: 0 }` solto zera todo `p-*`. A única exceção deliberada fora de layer é o `@media print` (ver _Impressão_).
- `@custom-variant dark` continua declarado, mas **nenhum arquivo usa `dark:`** desde o refactor de 2026-11-09: o token já muda de valor nos dois temas. Só reintroduza se o token não der conta.
- O `@theme inline` aponta pra variável: se o nome não existir no `:root`, a cor some sem erro.
- **Borda não herda cor de token**: `border`/`border-b` dão só espessura, a cor padrão do v4 é `currentColor`. Toda borda precisa de `border-border` (divisória) ou `border-border-forte` (contorno de controle) explícito. Detalhe em `src/components/ui/CLAUDE.md`.
- Renomes do v3→v4 já aplicados nas telas: `shadow-sm`→`shadow-xs`, `rounded`→`rounded-sm`, `outline-none`→`outline-hidden`, `aspect-[4/3]`→`aspect-4/3`. Código novo vindo da `main` com classe v3 precisa do mesmo renome.

## Design system

Tudo que desenha está em `src/components/ui/` (ler o `CLAUDE.md` de lá). **O contrato visual — as dez regras, paleta, raio, movimento, estados e a11y — é `docs/frontend/principios-de-ui.md`; ele é lei para qualquer tela nova e o código anterior a 2026-11-09 não serve de exemplo estético.** Vitrine em `/ui` (`src/pages/Vitrine.tsx`) — catálogo vivo de tokens, variantes e estados; ela monta a casca na mão, então só abre com sessão. `components.json` configura o CLI do shadcn (`new-york`, aliases `@/components/ui` e `@/lib/utils`); `cn()` fica em `src/lib/utils.ts` (clsx + tailwind-merge). Não há mais componente fora de `ui/` (o legado `.jsx` saiu na fase 4).

## Camada de dados, auth e rotas

Fluxo de uma tela: **página → hook de `src/hooks/<recurso>.ts` → `api.<recurso>` de `src/lib/api` → `fetch('/api/...')`**. Página nunca chama `fetch` (lint barra fora de `src/lib/api/**`) nem `api.*` direto: usa o hook.

```tsx
import { toast } from 'sonner'
import { ErroDeCarregamento, mensagemDeErro } from '@/components/ui/erro-de-carregamento'
import { useCriarCarga } from '@/hooks/cargas'
import { useLinhas } from '@/hooks/linhas'
import { tratouErrosDeCampo } from '@/lib/api'

const { data: linhas, isPending, error } = useLinhas()
const criar = useCriarCarga()
if (error) return <ErroDeCarregamento error={error} />
criar.mutate(carga, {
  onSuccess: () => toast.success('Carga cadastrada'),
  onError: (e) => {
    if (tratouErrosDeCampo(e, formulario)) return
    toast.error(mensagemDeErro(e))
  },
})
```

- **Hooks** (`src/hooks/`): um módulo por recurso, sem fábrica genérica. Chave = nome do recurso (`['cargas']`, `['usuarios', id]`); mutação invalida a chave do recurso. `usuarios.ts` também invalida `['me']` (a gestão pode editar a si mesma).
- **Erro**: tudo que a API recusa vira `ApiError` (`status`, `body.detail`; `message` = `detail` quando é string). Falha de rede chega como `TypeError`, não `ApiError`. Helpers únicos, não reescreva na página:
  - `422` (lista `loc`/`type`) → `if (tratouErrosDeCampo(erro, formulario)) return` (`@/lib/api`): marca "Valor inválido" em cada campo do `loc` que existe no form.
  - Estado de erro de query → `<ErroDeCarregamento error={error} />`; texto de toast → `mensagemDeErro(erro)` (os dois de `@/components/ui/erro-de-carregamento`).
  - `criado_em` e demais datetimes vêm sem fuso e em UTC → `dataHora(iso)` de `@/lib/utils` (soma `Z` antes do `new Date`). Data pura (`AAAA-MM-DD`, ex: `ultima_inspecao`, `inicio` do relatório) → `dataBrasileira(iso)`, que só reordena a string. Número → `formatarNumero` (pt-BR, até 2 casas).
  - Rótulo de cargo e de tipo de relatório → `lib/rotulos.ts`. Rótulo de status → `rotuloDeStatus`/`opcoesDeStatus` de `selo-de-status.tsx`.
- **Retry**: queries só repetem erro que não é `ApiError` (rede); 4xx/5xx da API falham na hora.
- **401 global**: `src/lib/cliente-de-consultas.ts` escuta erro de qualquer query/mutação; `401` zera `['me']` → o guard manda pro `/login`. Tela não trata 401.
- **Sessão**: `contexts/Autenticacao.tsx` → `useAutenticacao()` dá `usuario` (`Usuario | null`), `carregando`, e as mutações `entrar`/`sair` (objetos do TanStack: `entrar.mutate(credenciais)`, `entrar.isPending`, `entrar.error`). `me` com `401` vira `null`, não erro. `entrar` grava `['me']` direto; `sair` zera `['me']` e remove o resto do cache.
- **Pós-login**: a tela de login só chama `entrar.mutate`. Quem navega é o `LayoutPublico`: com usuário, manda pra `state.de` (URL que o guard guardou) ou pro início do papel (`cliente` → `/viagens`, resto → `/admin`; `inicioDo` em `Aplicacao.tsx`).
- **Rotas** (`src/Aplicacao.tsx`, layout routes do react-router 7): `LayoutPublico` (login/cadastro/recuperar), `LayoutProtegido` (exige sessão, envolve `CascaDePagina` + `Suspense`), `Papeis` (papel errado → início do papel). Tabela completa em `docs/frontend/dados-e-rotas.md`. Rota nova: `lazy(() => import(...))` + `<Route>` dentro do grupo de papel certo + item na constante `GRUPOS` do `casca-de-pagina.tsx` (no grupo de tarefa certo, com `papeis` e `dock: true` só se tiver que aparecer na pílula do celular).
- **Raiz** (`principal.tsx`): `QueryClientProvider` → `ProvedorDeTema` → `ProvedorDeAutenticacao` → `TooltipProvider` → `Aplicacao` + `Toaster`. Tela não monta `Toaster` nem `TooltipProvider`.
- **Formulário de cadastro/edição** abre em `Dialog` sobre a lista (carga, usuários), não em rota própria.
- **Tela logada não monta `CascaDePagina`**: o `LayoutProtegido` já envolve.

## Impressão

Só os relatórios (`/admin/relatorios/ver`) são feitos pra sair no papel. O que sustenta isso:

- O bloco `@media print` de `src/index.css` fica **fora de qualquer `@layer`, de propósito**. CSS sem layer vence as utilities do Tailwind (que vivem em `@layer utilities`); o `.nao-imprime { display: none }` não leva `!important`, então dentro de um layer ele perderia para `flex`/`inline-flex` no mesmo elemento (no relatório a classe está em cada `Button`, e todo `Button` é `inline-flex`). Não mova o bloco pra dentro de `@layer base`.
- `.nao-imprime` esconde chrome. Hoje ela está na barra lateral, no cabeçalho de marca do celular e no dock (`casca-de-pagina.tsx`), no alternador de tema das telas deslogadas (`LayoutPublico` em `Aplicacao.tsx`) e nos botões do relatório. Elemento novo que não deve ir pro papel leva essa classe.
- O mesmo bloco redefine os tokens de `:root` e `.escuro` para preto sobre branco, porque no tema escuro o papel saía com texto claro sobre fundo branco. Desde 2026-11-09 ele cobre **todos** os tokens de cor (os 30 do `@theme inline`, incluindo `popover*`, `secondary*`, `accent*`, `input`, `ring`, `overlay`, `border-forte`, `danger-ink`, `delay*` e `destructive*`) — então tela imprimível nova não precisa mais acrescentar token, só manter a lista completa se um token novo nascer. `success`, `danger` e `destructive` ficam todos pretos e `warning`/`delay` cinza, então a cor deixa de significar status no papel: o rótulo do selo é o que informa.
- Variantes `print:block` / `print:hidden` em vez de só `md:`: a folha A4 é mais estreita que o breakpoint `md`, então a versão em cartões ganharia da tabela. Padrão: tabela `hidden md:block print:block`, cartões `md:hidden print:hidden`.
- Não há teste automático: confira com Ctrl+P (pré-visualização) nos dois temas.

## TypeScript

Pinado em `~6.0.x`: o `typescript-eslint` exige `typescript >=4.8.4 <6.1.0`; TS 7 quebra o lint type-aware. Só sobe quando o peer range do `typescript-eslint` aceitar.

`tsconfig.json` é strict e cobre `src/**/*.ts`, `src/**/*.tsx` e `vite.config.ts` — ou seja, todo o `src/` (não existe mais `.js`/`.jsx` lá; arquivo novo é `.ts`/`.tsx`, sem `allowJs`). Alias `@/*` → `src/*` configurado nos dois lugares: `tsconfig.json` (`paths`) e `vite.config.ts` (`resolve.alias`). Mudou um, mude o outro.

## Dev server

**Túnel externo (ngrok).** `server.allowedHosts: ['.ngrok-free.dev']` existe porque o Vite devolve **403 "Blocked request"** para qualquer `Host` que não conheça — sem essa linha, um túnel ngrok só retorna erro. O sufixo (em vez do domínio exato) sobrevive à troca de URL, que no plano gratuito muda a cada sessão. Isso **não** fura o isolamento da arquitetura: o túnel aponta para a porta do frontend, e o backend continua sem porta publicada — a API sai pelo proxy `/api`, exatamente como no navegador local. O que muda é que, enquanto o túnel estiver no ar, **qualquer pessoa com o link entra no app com as senhas de seed**. Derrube o túnel quando terminar.

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

`python3 fsc.py ui add <comp>` roda `eslint --fix src/components/ui` depois do CLI do shadcn: é o autofix do `no-comments` que tira os comentários gerados (R6). O fix deixa linha em branco/espaço sobrando; o Prettier limpa.
