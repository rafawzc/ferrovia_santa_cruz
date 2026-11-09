# Frontend — responsividade (mobile-first)

> Referenciado pelo `.claude/CLAUDE.md` (P1 *Mobile-first* + seção Frontend). O site tem que funcionar igual de bem em desktop e mobile — é requisito da SA, não enfeite.

## Princípio: mobile-first

Comece desenhando/codando o layout **mobile**, depois suba pros breakpoints maiores. Nunca "faço desktop e depois adapto pro celular" — adaptar pra baixo sempre quebra. Cada tela é testada nos dois antes de declarar pronta.

O design vem do usuário em **imagens separadas (mobile e desktop)** — siga as imagens, não invente layout. O sistema de tokens já existe: consuma token, nunca chumbe valor solto (o lint barra).

Composição, hierarquia e estados são regidos por [`principios-de-ui.md`](principios-de-ui.md) (contrato do refactor de 2026-11-09): mobile é a primeira composição, começa em **390px** e sobe; alvo de toque ≥ 44px; botão principal em largura cheia no celular.

## Consumo de API

Chamadas à API sempre por **caminho relativo** `/api/...` — o proxy do Vite resolve pro backend pela rede interna. Nunca URL absoluta (`http://localhost:8000`). Detalhe do porquê em [`../arquitetura/containers-e-rede.md`](../arquitetura/containers-e-rede.md).

## Padrões responsivos reais (desde 2026-11-09)

Os padrões abaixo são os que o app usa hoje, conferidos no código. Tela nova segue estes — dois jeitos de fazer a mesma coisa é justamente o que o refactor veio tirar (regra 1 de [`principios-de-ui.md`](principios-de-ui.md)).

| Elemento | Celular (até o corte) | Desktop | Corte |
|----------|-----------------------|---------|-------|
| **Navegação** | dock em pílula fixa embaixo com os itens `dock` do papel (4 na equipe, 2 no cliente) + botão Menu, que abre uma folha (`Sheet side="bottom"`) com todos os grupos; acima do conteúdo, só o cabeçalho de marca | barra lateral fixa de 16rem com a navegação em grupos (Operação, Frota, Gestão, Conta) e, no rodapé, nome/cargo + alternador de tema + "Sair da conta" | `lg` |
| **Lista de dados** | `<ul>` de cartões: identificador em destaque, selo de status à direita, o resto como `dt`/`dd` | tabela dentro de um `Card`, cabeçalho em rótulo de 13px caixa alta, numérico à direita com `tabular-nums` | `md` (`lg` na carga, que tem 7 colunas) |
| **Métricas do dashboard** | 1 coluna | `sm:grid-cols-2`, `lg:grid-cols-3` | `sm`/`lg` |
| **Gráficos** | 1 coluna | `lg:grid-cols-2` | `lg` |
| **Filtros** | grade de 2 colunas (busca ocupando a linha inteira) | 3 ou 4 colunas na mesma linha de borda do conteúdo | `md`/`lg` |
| **Cabeçalho de tela** | título, apoio e ações empilhados, botão em largura cheia | título à esquerda, ações à direita | `sm` |
| **Ação principal de formulário** | largura cheia | alinhada à direita (`sm:self-end`) | `sm` |
| **Cadastro/edição** | `Dialog` com `max-h-dvh overflow-y-auto` (nunca rota própria) | o mesmo `Dialog` | — |
| **Relatório impresso** | cartões na tela | tabela | `md` **e** `print` (ver abaixo) |

Dois detalhes que já morderam:

- **O dock come o rodapé do conteúdo.** O `main` da casca leva `pb-28` no celular (`lg:pb-12`, `print:pb-0`); tela que inventar o próprio rodapé fixo tem que respeitar isso.
- **`print:` não é `md:`.** A folha A4 é mais estreita que o breakpoint `md`, então a tabela precisa de `hidden md:block print:block` e os cartões de `md:hidden print:hidden`, senão o papel sai com a versão de celular. Detalhe em [`telas/admin-relatorios.md`](telas/admin-relatorios.md).

Alvo de toque ≥ 44px fora de texto corrido: `Button` default é `h-11` e `size="icon"` é `size-11`; o `Switch` alcança 44px por pseudo-elemento. Nada de rolagem horizontal, inclusive em 320px.

## Dois lados, duas experiências

- **Admin** — gerenciamento + informação (dashboard, CRUDs, métricas).
- **Cliente** — informação (consulta de horários, trens, estações).

Pense nas rotas e nos guards de acesso desde cedo: o que é público (cliente) vs. o que exige login (admin). Os dois lados são responsivos.

## Testes

**Não há teste de front** (decisão de 2026-09-22, [`../decisoes/frontend-e-qualidade.md`](../decisoes/frontend-e-qualidade.md) F5 — substitui o Vitest + Testing Library planejado antes). O gate do front é `python3 fsc.py check` (typecheck + lint + build). Toda tela se verifica **à mão no navegador**, em mobile E desktop, antes de ser dada como pronta.
