# Refatoração total da UI — 2026-11-09

**Status:** implementado, documentado · **Dono:** lowh · **Contrato visual:** [`docs/frontend/principios-de-ui.md`](../frontend/principios-de-ui.md) · **Decisão:** [`docs/decisoes/frontend-e-qualidade.md`](../decisoes/frontend-e-qualidade.md) (F7)

## Problema

A UI entregue até aqui está visualmente inconsistente: alinhamentos quebrados, hierarquia fraca, estados indistintos, densidade aleatória entre telas. O código existente **não serve de exemplo estético** — foi descartado de propósito como referência.

## Decisões travadas

| # | Decisão | Alternativa recusada |
|---|---|---|
| D1 | **Recompor tela inteira e revisar o fluxo.** Layout, hierarquia, agrupamento, densidade e navegação são refeitos. Rotas, papéis, contrato de API e hooks ficam intactos. | Só repintar (mantém o desalinhamento estrutural). |
| D2 | **As 6 cores do guia de estilo são âncoras; o resto é derivado e medido.** O fundo `#d5c4a8` que existia não está no guia e sai. | Lei literal das 6 cores (reprova contraste AA). |
| D3 | **Claro e escuro no mesmo padrão.** Toda tela é conferida nos dois. | Só o claro agora (dívida garantida). |
| D4 | **Status é sempre selo preenchido com rótulo.** Medido: nenhum tom de status atinge 4.5:1 como texto sobre `card`, mas todos passam como preenchimento com tinta clara. | Texto colorido ou ponto de cor. |
| D5 | **A API dos primitivos é congelada** durante o refactor (nomes de componente, prop, `variant`, `size`). Só classe e estado mudam. | Redesenhar a API junto (impede fan-out paralelo). |
| D6 | **O tasteskill foi destilado, não aplicado.** Ele é um skill de landing page de empresa (hero, seção por tela, fotografias, moments, shaders); isto é app logado. Ficou o que vale em qualquer interface — um sistema só, bordas alinhadas, movimento discreto, verificação em navegador real. O skill foi usado a partir de um clone local e apagado depois. | Aplicar ao pé da letra (destruiria o produto). |

## Plano de execução

| Onda | Quem | Arquivos | Depende de |
|---|---|---|---|
| 0a | agente fundação-tokens | `src/index.css` + primitivos shadcn de `components/ui/` | — |
| 0b | agente fundação-casca | casca, cabeçalho, layouts e compostos de domínio, `Aplicacao.tsx` | — (API dos primitivos congelada) |
| 1 | um agente por grupo de tela | `src/pages/**` | 0a + 0b |
| 2 | orquestrador | gate, revisão de doutrina, verificação no navegador (390px e 1440px, dois temas) | 1 |

Dois agentes nunca escrevem o mesmo arquivo. O gate (`python3 fsc.py check`) é rodado pelo orquestrador, não pelos agentes — containers concorrentes brigariam pelo mesmo `node_modules`.

## Critério de pronto

O da seção 8 do documento de princípios: gate verde, tela aberta em 390px e 1440px nos dois temas com a conta de dev, conferida item a item contra a seção 0, e relatório dizendo o que foi e o que não foi verificado.

---

## Log de implementação

### Onda 0a — tokens e primitivos (`src/index.css`, 16 dos 19 primitivos)

- Paleta inteira trocada pelos valores medidos do documento de princípios; o fundo `#d5c4a8` (fora do guia), `border: #ffffff` e `input: #ffffff99` saíram. O `.escuro` passou a redeclarar **todos** os tokens, inclusive os de status.
- Tokens novos: `border-forte` (contorno de controle, ≥ 3:1), `danger-ink` (texto de erro) e a escala tipográfica `text-rotulo` 13px / `text-corpo` 15px / `text-titulo` 28px / `text-destaque` 32px. `destructive` passou a carregar o mesmo hex de `danger` (cópia, não `var()`).
- `--radius` 1rem → **1.25rem**. Transição global 300ms `ease` → **150ms `ease-out`**, e a lista de propriedades trocou `fill`/`stroke` por `box-shadow`/`transform` (é o que o hover de botão e cartão usa); mais um bloco `prefers-reduced-motion`. O `body` passou a declarar cor e fundo pelos tokens.
- `@media print` foi de 12 para **todos** os tokens de cor (30), continuando fora de `@layer` de propósito.
- Nos primitivos: foco de `ring-[3px]` para `outline-2 outline-offset-2 outline-ring`; `aria-invalid` só muda a borda; **todo `dark:` removido** (zero ocorrências hoje); camadas (`Dialog`, `AlertDialog`, `Sheet`, `SelectContent`) migraram de `bg-background` para `bg-popover`; borda ganhou cor explícita em todo lugar (no v4 `border-b` é só espessura); `Button` sobe 1px no hover e `size="icon"` foi pra `size-11` (44px); `Switch` ganhou pseudo-elemento de 44px de alcance; `Table` ganhou zebra e `TableHead` virou o rótulo de 13px caixa alta; textos "Close" viraram "Fechar". `avatar`, `separator` e `sonner` não precisaram de mudança.

### Onda 0b — casca, cabeçalho, layouts e compostos

- `casca-de-pagina.tsx`: `NAV` (lista plana) → **`GRUPOS`** (grupos por tarefa, item com `papeis` e `dock?`). Barra lateral fixa no `lg`, dock em pílula com os itens `dock` do papel + botão Menu (folha com todos os grupos) abaixo disso. A barra "Conectado como…" deixou de existir: sessão, tema e sair foram pro rodapé da barra lateral e da folha.
- `Aplicacao.tsx`: o alternador de tema global saiu da raiz e virou parte do `LayoutPublico` (telas deslogadas); nas logadas ele vive na casca.
- `cabecalho-de-tela.tsx`: prop nova `apoio`. `selo-de-status.tsx`: status novo `inativo` e `programada` virou selo preenchido. `erro-de-carregamento.tsx`: prop nova `aoTentarDeNovo?`. `cartao-de-metrica.tsx`: a bolinha de cor virou `SeloDeStatus` e a prop `status` aceita qualquer `Status`. `cartao-de-linha` e `cartao-de-usuario`: situação por selo. `lista-de-viagens`: cartão lidera pelo trajeto, tabela dentro de `Card`. `layout-de-autenticacao`: conteúdo em `max-w-md`, raio por token.

### Onda 1 — as 14 telas (+ a vitrine)

Todas recompostas na ordem cabeçalho → resumo → filtro → conteúdo → camadas, com os três estados desenhados. A vitrine `/ui` foi reescrita junto: superfícies, tintas, status, tipografia por token, variantes/tamanhos de `Button` e `Badge`, compostos do domínio e estados (`ErroDeCarregamento` com `aoTentarDeNovo`). O que mudou de visível nas telas:

| Tela | Mudança principal |
|---|---|
| Dashboard | métricas e gráficos reordenados; "Sensores críticos" com selo em vez de bolinha; apoio no título do `operacional` |
| Rotas | "Ativa: Sim/Não" unificado em selo (`ativo`/`inativo`); vazios próprios por aba |
| Alertas | formulário saiu da coluna fixa e virou `Dialog`; lista em cartões também no desktop; tratado ganhou `Badge` em vez de opacidade |
| Carga | cartões abaixo de `lg`, tabela a partir de `lg` (7 colunas), nenhuma coluna escondida; vazio com ação |
| Usuários | dois vazios distintos (busca sem resultado × base vazia); edição por botão de ação — o nome deixou de ser link; tabela a partir de `md` |
| Trens, Sensores | cartões/tabela no corte `md`, dois vazios, apoio dizendo de quem é a escrita |
| Relatório (ver) | resumo em `dl` saiu e virou cabeçalho de documento (`apoio` com período e alvo); ações no cabeçalho; vazios em cartão |
| Perfil | grade de identidade + dois cartões (dados e senha); "Sair" em `outline` |
| Viagens | vazio com texto que muda conforme o filtro |
| Login, Cadastro, Recuperar | erro da requisição em faixa no topo; títulos em frase; sucesso da recuperação com ícone e título |

### Onda 2 — fechamento

- Gate `python3 fsc.py check`: relatado verde pelo orquestrador ao fim da onda 1. O passo de documentação não re-rodou o gate (não toca código).
- **Não verificado:** a conferência no navegador em 390px e 1440px nos dois temas com a conta de dev, item a item contra a seção 0 (critérios 2 e 3 da seção 8). Enquanto ela não for feita e relatada, o critério de pronto do documento de princípios não está cumprido.
- Documentação atualizada: `docs/CLAUDE.md`, `docs/frontend/{principios-de-ui,design-system,tema,tema-escuro,responsividade,dados-e-rotas}.md`, `docs/frontend/telas/*` (os 7), `frontend/CLAUDE.md`, `frontend/src/components/ui/CLAUDE.md` e a decisão F7.

## Dívidas deixadas em aberto

| O quê | Onde |
|---|---|
| `/ui` abre em branco sem sessão: a vitrine é rota pública e monta a casca na mão, mas `CascaDePagina` faz `if (!usuario) return null`. **Aceita pelo dono do projeto em 2026-11-09** — a vitrine é ferramenta interna e quem a usa está logado. | `components/ui/casca-de-pagina.tsx` |
| ~~`CartaoDeLinha`, `Progress` e `Separator` só são usados pela vitrine.~~ **Paga em 2026-11-09:** `cartao-de-linha.tsx` e `progress.tsx` apagados; `separator.tsx` fica porque o `FieldSeparator` de `field.tsx` o importa. | `components/ui/` |
| ~~`docs/entregas/manual-do-usuario.md` e `docs/entregas/roteiro-de-testes.md` ainda descrevem a barra "Conectado como…" e o menu inferior como únicos.~~ **Paga em 2026-11-09:** os dois foram reescritos contra o código (24 casos do roteiro revisados, manual com a navegação real). | `docs/entregas/` |
| ~~`docs/decisoes/uniformizacao-telas.md` (L6) ainda fala em cor de status fixa.~~ **Paga em 2026-11-09:** L6 marcado como superado pela F7. | `docs/decisoes/` |
