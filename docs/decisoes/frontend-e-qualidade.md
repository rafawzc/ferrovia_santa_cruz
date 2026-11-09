# Decisões de frontend e gate de qualidade

> F1–F6: decisões da fundação (fase 1 do plano [`../tasks/lowh-fundacao-design-system-2026-09-22.md`](../tasks/lowh-fundacao-design-system-2026-09-22.md), 2026-09-22). **F7: a refatoração total da UI (2026-11-09).** Mesmo formato do [`stack.md`](stack.md): contexto, decisão, porquê, consequência. Os `Lxx` apontam pras *Locked Decisions* dos planos.
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

**Decisão:** shadcn/ui. Primitivos shadcn e compostos do domínio (`SeloDeStatus`, `CartaoDeLinha`, `CascaDePagina`…) moram juntos em `src/components/ui/`. Tokens renomeados pro vocabulário shadcn (`--background`, `--primary`, `--muted`…) com a paleta marrom/bege. (L10, L11)

**Porquê:** shadcn copia o código pro repo (não é lib fechada) — dá pra ajustar à paleta. Vem com a11y pronta (Radix por baixo): foco, teclado, ARIA. E fala Tailwind v4 nativo.

**Consequência:** o `shadcn init` **não** rodou na fase 1 — os nomes de token do shadcn colidem com os atuais (`--color-primary`, `--color-border`), então a troca de nomes e o init vão juntos na fase 2. Componente novo entra por `python3 fsc.py ui add <comp>`, que já roda o autofix do lint pra tirar os comentários gerados.

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

## F6 — CI com `python3 fsc.py check` em todo PR

**Data:** 2026-09-22 · **Status:** vigente (ruleset pendente do dono do repo)

**Contexto:** lint local depende de boa vontade. O repo `rafawzc/ferrovia_santa_cruz` é público, então GitHub Actions é grátis.

**Decisão:** `.github/workflows/ci.yml`, job `check`, roda `python3 fsc.py check` em todo PR e em push na `main`. Sem git hook. Ruleset na `main` exigindo PR e o check verde. (L20)

**Porquê:** o CI roda o **mesmo** comando que você roda local — não existe "passa aqui, quebra lá". Ruleset transforma o CI de aviso em trava.

**Consequência:** lowh não é admin do repo, então o ruleset tem que ser criado pelo rafawzc. Passo a passo em [`../arquitetura/operacao.md`](../arquitetura/operacao.md). Até lá o CI é só informativo.

---

## F7 — Refatoração total da UI, com um contrato visual escrito

**Data:** 2026-11-09 · **Status:** vigente · **Plano:** [`../tasks/lowh-refatoracao-ui-2026-11-09.md`](../tasks/lowh-refatoracao-ui-2026-11-09.md) · **Contrato:** [`../frontend/principios-de-ui.md`](../frontend/principios-de-ui.md)
>
> **Supera:** a paleta anterior e a regra de que status é cor igual nos dois temas, descritas em [`../frontend/tema.md`](../frontend/tema.md) e [`../frontend/tema-escuro.md`](../frontend/tema-escuro.md) (os dois foram reescritos com os valores novos). Do L6 de [`uniformizacao-telas.md`](uniformizacao-telas.md) sobrevive a **semântica** (normal=verde · atenção=amarelo · crítico=vermelho) e o mapa do L7; cai a ideia de tom "fixo": os tons são dessaturados para o clima sépia e têm valor próprio em cada tema. Esse arquivo não foi reescrito — na dúvida sobre cor de status, vale esta entrada.

**Contexto:** as 14 telas estavam funcionando e no contrato da API, mas visualmente inconsistentes: alinhamentos quebrados, hierarquia fraca, densidade aleatória de tela em tela, estados indistintos (status como bolinha de cor ou texto colorido), paleta com um fundo que não estava no guia de estilo (`#d5c4a8`), `border: #ffffff` praticamente invisível e status de biblioteca (`#dc2626`, `#eab308`) brigando com o sépia. Cada tela nova herdava o desalinhamento da anterior, porque o "padrão" era o código vizinho, e o código vizinho estava errado.

**Decisão:** recompor a UI inteira numa tacada — tokens, primitivos, casca de navegação, compostos do domínio e as 14 telas — **e escrever o contrato visual num documento que passa a ser lei** (`docs/frontend/principios-de-ui.md`). Rotas, papéis, hooks e contrato de API ficam intactos; a API dos primitivos (nome, prop, `variant`, `size`) foi congelada durante o trabalho. Os pontos travados:

| # | Decisão | Alternativa recusada |
|---|---|---|
| D1 | Recompor tela inteira (layout, hierarquia, agrupamento, densidade, navegação), não repintar. | Só trocar cores — mantém o desalinhamento estrutural. |
| D2 | As 6 cores do guia de estilo são âncoras; o resto é derivado e **medido** por contraste. | Lei literal das 6 cores (reprova AA). |
| D3 | Claro e escuro são a mesma tela; todo token é redeclarado no `.escuro`. | Só o claro agora (dívida garantida). |
| D4 | **Status é sempre selo preenchido com rótulo** — nunca ponto de cor, nunca texto colorido, nunca "Sim/Não". | Texto colorido ou bolinha (o que havia). |
| D5 | Navegação por **grupos de tarefa** (`GRUPOS`): barra lateral no desktop, dock de 4 itens + Menu no celular; sessão/tema/sair no rodapé da casca. | Manter a lista plana e a barra "Conectado como…" no topo. |
| D6 | O *tasteskill* foi **destilado**, não aplicado: ficou o que vale em app logado (um sistema só, bordas alinhadas, hierarquia, movimento discreto, verificação em navegador); hero, seção por tela, fotografias, shaders e footer de marketing foram descartados. | Aplicar ao pé da letra (vocabulário de landing page num painel de operação). |

**Porquê:** o problema não era gosto, era falta de sistema — sem um documento que diga qual é o botão, qual é o raio, como se mostra status e o que é um estado vazio, cada pessoa (e cada agente) inventa o seu e a inconsistência volta no PR seguinte. Medir contraste em vez de escolher no olho fecha a porta do bug de 2026-07 (cor "bonita" ilegível). E concentrar tudo numa tacada foi mais barato do que corrigir tela por tela, porque tokens e primitivos mudam o visual de todas elas ao mesmo tempo.

**Consequência:**

- `principios-de-ui.md` é leitura obrigatória antes de desenhar tela, e **o código anterior a 2026-11-09 não serve de exemplo estético**.
- Nasceram três tokens por necessidade medida: `border-forte` (contorno de controle, ≥ 3:1), `danger-ink` (texto de erro) e a escala tipográfica (`text-rotulo/corpo/titulo/destaque`). O `@media print` passou a cobrir todos os tokens de cor.
- O visual é regido por token e variante: nenhum primitivo usa `dark:` e nenhuma tela usa cor crua (o lint de F4 continua sendo o que garante).
- O gate de F5 não cobre regressão visual: a verificação segue manual, em 390px e 1440px, nos dois temas (seção 8 do contrato).
- Dívidas assumidas no fechamento do refactor: `CartaoDeLinha`, `Progress` e `Separator` ficaram sem uso fora da vitrine; `/ui` abre em branco sem sessão (a vitrine monta a casca, que não renderiza sem usuário); e a `docs/entregas/` (manual do usuário, roteiro de testes) ainda descrevia a barra "Conectado como…", que deixou de existir.
- **Baixa dessas dívidas, 2026-11-09 (mesma data, faxina depois do refactor):** `cartao-de-linha.tsx` e `progress.tsx` foram apagados, junto das seções deles na vitrine — nenhuma tela os usava e a barra de progresso real é o `grafico-de-barras`. `separator.tsx` **ficou**: o `FieldSeparator` do `field.tsx` o importa. O manual do usuário e o roteiro de testes foram reescritos para a navegação em grupos (barra lateral no desktop, faixa de 4 itens + Menu no celular) e para os rótulos reais de botão e de coluna. `/ui` em branco sem sessão continua como está.
