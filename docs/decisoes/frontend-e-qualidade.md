# Decisões de frontend e gate de qualidade

> Registro das decisões da fundação (fase 1 do plano [`../tasks/lowh-fundacao-design-system-2026-09-22.md`](../tasks/lowh-fundacao-design-system-2026-09-22.md)). Mesmo formato do [`stack.md`](stack.md): contexto, decisão, porquê, consequência. Os `Lxx` apontam pras *Locked Decisions* do plano.
>
> Supera: a parte de testes do D3 em [`stack.md`](stack.md) (Vitest) e as seções de CSS Modules / JS / Vitest do [`../PLANO_IMPLEMENTACAO.md`](../PLANO_IMPLEMENTACAO.md).

---

## F1 — Tailwind v4 com tokens em CSS (no lugar de CSS Modules)

**Data:** 2026-09-22 · **Status:** vigente

**Contexto:** o `PLANO_IMPLEMENTACAO.md` planejava CSS Modules + `styles/tokens.css`. Na prática o front já nasceu em Tailwind 3 com `tailwind.config.js` e tokens em canais RGB. Dois sistemas de estilo planejados, um usado.

**Decisão:** Tailwind **v4** (`@tailwindcss/vite`). Config mora no CSS: os tokens de cor/fonte ficam no `@theme` de `frontend/src/index.css`. Sem `tailwind.config.js`, sem `postcss.config.js`, sem CSS Modules. (L8)

**Porquê:** o código real já era Tailwind — trocar pra CSS Modules seria reescrever tudo pra trás. O v4 aceita cor direta (hex) e faz opacidade com `color-mix`, então morre o truque dos canais RGB do v3. Um só lugar pra cor = um só lugar pro lint vigiar.

**Consequência:** token novo = variável no `@theme`, não arquivo JS. Estilo global próprio tem que ir em `@layer base`, senão ganha de qualquer utilitário. Detalhe em [`../frontend/tema.md`](../frontend/tema.md) e [`../../frontend/CLAUDE.md`](../../frontend/CLAUDE.md).

---

## F2 — shadcn/ui como base do design system

**Data:** 2026-09-22 · **Status:** vigente (entra na fase 2)

**Contexto:** 11 componentes caseiros sem padrão (Button com ícone chumbado, Modal que não é dialog, Tabs sem ARIA). Precisamos de um design system que o grupo inteiro siga.

**Decisão:** shadcn/ui. Primitivos shadcn e compostos do domínio (`StatusBadge`, `LineCard`, `PageShell`…) moram juntos em `src/components/ui/`. Tokens renomeados pro vocabulário shadcn (`--background`, `--primary`, `--muted`…) com a paleta marrom/bege. (L10, L11)

**Porquê:** shadcn copia o código pro repo (não é lib fechada) — dá pra ajustar à paleta. Vem com a11y pronta (Radix por baixo): foco, teclado, ARIA. E fala Tailwind v4 nativo.

**Consequência:** o `shadcn init` **não** rodou na fase 1 — os nomes de token do shadcn colidem com os atuais (`--color-primary`, `--color-border`), então a troca de nomes e o init vão juntos na fase 2. Componente novo entra por `./fsc ui add <comp>`, que já roda o autofix do lint pra tirar os comentários gerados.

---

## F3 — TypeScript strict

**Data:** 2026-09-22 · **Status:** vigente

**Contexto:** front em JS puro (~1.250 linhas JSX), com props e dados sem contrato.

**Decisão:** TypeScript **strict**, migrando junto com a reescrita das telas. `tsconfig.json` cobre só `.ts/.tsx`; as telas `.jsx` antigas ficam fora até a fase 4. TS pinado em `~6.0.x`. (L3)

**Porquê:** sem teste de front (F5), o compilador é a primeira rede de segurança — pega prop errada e dado mal formado antes do navegador. O pin é porque o `typescript-eslint` só aceita `typescript <6.1.0`; o TS 7 quebra o lint type-aware.

**Consequência:** sobe de TS só quando o peer range do `typescript-eslint` deixar.

---

## F4 — ESLint + Prettier com as regras do design system

**Data:** 2026-09-22 · **Status:** vigente

**Contexto:** regra escrita no `CLAUDE.md` sem ferramenta = regra ignorada. Com quatro pessoas mexendo nas telas, o padrão precisa ser imposto, não pedido.

**Decisão:** ESLint 9 flat (`typescript-eslint` strictTypeChecked + react-hooks + jsx-a11y + react-refresh) + Prettier com `prettier-plugin-tailwindcss`. Mais regras locais que proíbem (L7, L12, L13):

- comentário no código (sem exceção de "porquê"; só pragma de ferramenta);
- cor crua (hex, `rgb(`, classe de paleta tipo `bg-red-500`) fora do `index.css`;
- `<button>/<input>/<select>/<textarea>/<dialog>` cru fora de `components/ui/`;
- `style={{}}` e valor arbitrário do Tailwind (`rounded-[3rem]`);
- import fora da fronteira (página importando `@radix-ui/*` ou outra página, `fetch` fora de `lib/api`).

No backend: `ruff` (lint + format) + `scripts/check_comments.py`.

**Porquê:** cada regra fecha uma porta de fuga do design system. Cor crua e `style` furam o tema; controle cru fura a a11y do shadcn; import cruzado vira espaguete. Zero comentário força código legível e manda o *porquê* pro lugar certo (`CLAUDE.md` de pasta e `docs/`). ESLint fica no 9 (e não 10) porque o `eslint-plugin-jsx-a11y` só aceita até `^9`.

**Consequência:** a tabela completa com as exceções vive em [`../../frontend/CLAUDE.md`](../../frontend/CLAUDE.md). Os `.jsx` legados estão fora do lint até virarem TSX.

---

## F5 — Sem testes de front

**Data:** 2026-09-22 · **Status:** vigente · **Supera:** a parte "Vitest + Testing Library" do D3 em [`stack.md`](stack.md)

**Contexto:** o D3 previa Vitest + Testing Library, mas nunca existiu teste de front (nem script `test`). O grupo tem pouco tempo e as telas mudam muito.

**Decisão:** nenhum teste de front. O gate do front é `typecheck` + `lint` + build. `/tdd` vale só pro backend. Tela se verifica à mão, no navegador, em mobile e desktop. (L27)

**Porquê:** teste de tela que muda toda semana custa mais do que protege. TS strict + lint rígido + build no CI pegam a maior parte do que quebraria.

**Consequência:** regressão visual só aparece no navegador — por isso a checagem manual mobile/desktop por tela continua obrigatória.

---

## F6 — CI com `./fsc check` em todo PR

**Data:** 2026-09-22 · **Status:** vigente (ruleset pendente do dono do repo)

**Contexto:** lint local depende de boa vontade. O repo `rafawzc/ferrovia_santa_cruz` é público, então GitHub Actions é grátis.

**Decisão:** `.github/workflows/ci.yml`, job `check`, roda `./fsc check` em todo PR e em push na `main`. Sem git hook. Ruleset na `main` exigindo PR e o check verde. (L20)

**Porquê:** o CI roda o **mesmo** comando que você roda local — não existe "passa aqui, quebra lá". Ruleset transforma o CI de aviso em trava.

**Consequência:** lowh não é admin do repo, então o ruleset tem que ser criado pelo rafawzc. Passo a passo em [`../arquitetura/operacao.md`](../arquitetura/operacao.md). Até lá o CI é só informativo.
