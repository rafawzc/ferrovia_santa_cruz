# components/ui/ — o design system inteiro

Primitivos shadcn **e** compostos do domínio moram juntos aqui (L11). Página só compõe o que está aqui.

**Antes de mexer em qualquer coisa desta pasta, leia `docs/frontend/principios-de-ui.md`** — é o contrato visual escrito no refactor de 2026-11-09 (as dez regras, a paleta medida, raio, movimento, a11y). Catálogo: `docs/frontend/design-system.md`. Tabela de tokens: `docs/frontend/tema.md`. Catálogo vivo: a vitrine em `/ui`.

## Adicionar primitivo shadcn

```bash
python3 fsc.py ui add <nome> [-y]      # da raiz do repo; roda o CLI e depois eslint --fix aqui (tira comentários)
python3 fsc.py npm run format          # limpa as linhas em branco que o fix deixa
python3 fsc.py lint fe                 # tem que passar
```

Depois do add, conserte na mão o que o lint pegar. Os casos já vistos:

- **`import { cn } from "cn"`**: o registry do shadcn passou a gerar isso (pacote npm `cn`, 2026-09) e instala a dep `cn`. Troque por `@/lib/utils` (`sed -i 's#from "cn"#from "@/lib/utils"#' src/components/ui/*.tsx`) e `python3 fsc.py npm uninstall cn`. O lint barra `cn` e `next-themes` aqui.
- `bg-black/50` do overlay → `bg-overlay`. `text-white` → `text-<cor>-foreground`.
- `style={}` é proibido até aqui: é por isso que o `grafico-de-barras` usa `<progress>` nativo em vez de `div` com largura; o `sonner` passa as vars em classe arbitrária (`[--normal-bg:var(--popover)]`) e lê o tema de `@/contexts/Tema` (não existe `next-themes`).
- `"use client"` sai (não tem RSC).

**O que o shadcn gera e o refactor desfez em todos os primitivos** — ao trazer componente novo, aplique o mesmo:

| O gerado                                                                        | O nosso                                                                             | Por quê                                                                                                                   |
| ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| `focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:border-ring` | `focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring` | um só jeito de foco, igual ao `button:focus-visible` global do `index.css`; `ring` é box-shadow e desaparece na impressão |
| `aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40`        | `aria-invalid:border-destructive` (e o texto em `text-danger-ink`)                  | estado não é só cor: o `FieldError` sempre diz o erro                                                                     |
| `dark:bg-…`, `dark:text-…`                                                      | nada                                                                                | o token já muda de valor nos dois temas — hoje há **zero** `dark:` nesta pasta                                            |
| `bg-background` em diálogo/folha                                                | `bg-popover text-popover-foreground`                                                | camada flutuante tem superfície própria                                                                                   |
| `transition-all`                                                                | `transition-[propriedades] duration-150 ease-out`                                   | movimento é 150ms (200ms em entrada de camada)                                                                            |

## Regras

- Só token (`bg-primary`, `text-muted-foreground`…). Cor crua é erro de lint até aqui. Valor arbitrário (`rounded-t-[3rem]`, `has-[>svg]:`) é liberado só nesta pasta.
- Ajuste de marca é por **variante cva** ou pelo token, nunca classe solta na página. Ex.: `Button` tem `success`; `Badge` tem `success warning danger delay`.
- `react-refresh/only-export-components` está desligado aqui (shadcn exporta `buttonVariants` junto do componente).
- `ui/` não importa páginas. Pode importar `@/contexts/*` e `react-router-dom`.
- Arquivo em kebab-case (`selo-de-status.tsx`), export nomeado.
- **Primitivo que só a vitrine usa não fica.** `cartao-de-linha.tsx` e `progress.tsx` saíram em 2026-11-09 por isso (a aba Rotas monta o cartão dela própria; a barra de progresso real é o `grafico-de-barras`). Antes de dar um por morto, `grep` por importador **dentro desta pasta** também: `separator.tsx` parece órfão na busca por tela, mas o `field.tsx` o importa no `FieldSeparator` — apagar quebra o build.

### Borda: no Tailwind v4 a cor **não** vem de graça

`border`, `border-b`, `border-t` definem **só a espessura**; a cor padrão é `currentColor`, não o token `--border`. Por isso todo primitivo carrega a cor explícita, inclusive dentro de seletor arbitrário (`[.border-b]:border-border` no `CardHeader`, `[&_tr]:border-border` no `TableHeader`). Esqueceu? A divisória sai na cor do texto e fica gritante no escuro.

Dois tokens, papéis diferentes — não troque um pelo outro:

| Token          | Onde                                                                                                                                                       | Contraste            |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| `border`       | divisória decorativa: `Card`, linha de `Table`, borda de `Dialog`/`Sheet`/`SelectContent`                                                                  | baixo, de propósito  |
| `border-forte` | contorno de **controle**: `Input`, `SelectTrigger`, `Switch`, `Button variant="outline"` (2px), `Badge variant="outline"`, `FieldLabel` com campo aninhado | ≥ 3:1 nos dois temas |

### `danger` vs `danger-ink`

`danger` é cor de **preenchimento** (selo, ícone em círculo, banner). Como **texto** ele não atinge 4.5:1 sobre `card` no tema claro — então texto de erro usa `text-danger-ink` (`FieldError` e `data-[invalid=true]` do `Field`). No escuro os dois valem o mesmo hex. Nunca `text-danger` para texto corrido.

`destructive` é o nome que os primitivos shadcn esperam; ele repete o hex de `danger` nos dois temas (é cópia, não `var(--danger)`) — mexeu num, mexa no outro.

### Alvo de toque de 44px

`Button` default é `h-11`, `size="icon"` é `size-11`. O `Switch` é visualmente 24×44 mas ganha alcance com um pseudo-elemento (`before:h-11 before:w-full`) em cima do controle — **não remova o `before:`**, é o que faz o toque bater 44px sem engordar o desenho.

## Compostos do domínio

`casca-de-pagina`, `layout-de-autenticacao`, `cabecalho-de-tela`, `selo-de-status`, `grafico-de-barras`, `lista-de-viagens`, `cartao-de-metrica`, `cartao-de-usuario`, `alternador-de-tema`, `campo-de-senha`, `erro-de-carregamento`, `estado-vazio`, `rotulo-de-dado`, `acoes-de-linha`, `banner-de-erro`. `TooltipProvider` e `Toaster` são montados uma vez no `principal.tsx`; não monte de novo.

### `casca-de-pagina`

- A lista de navegação é a constante **`GRUPOS`**: grupos por tarefa (sem título no primeiro, depois Operação, Frota, Gestão, Conta), cada item com `papeis` (quem vê) e `dock?: true` (quem aparece na pílula do celular). Rota nova = item no grupo certo; sem `dock`, ela existe só na barra lateral e na folha.
- Duas apresentações da **mesma** `GRUPOS`: `BarraLateral` (`aside` fixo, `lg:flex`) e `Dock` (`lg:hidden`, pílula fixa embaixo com os itens `dock` do papel — 4 para a equipe, 2 para o `cliente` — mais o botão Menu, que abre a folha com **todos** os grupos).
- **Não existe mais barra "Conectado como…"**. Nome, cargo, `AlternadorDeTema` e "Sair da conta" vivem no rodapé da barra lateral e no `SheetFooter` da folha. O alternador global só existe no `LayoutPublico` (`Aplicacao.tsx`), para as telas deslogadas.
- **`BotaoDeSair` é exportado** (barra lateral, folha e, na onda de adoção, o cartão do `Perfil`): `Button variant="outline" w-full` que chama `sair.mutate` e mostra toast no erro. Sem props — ele mesmo lê `useAutenticacao`. Não escreva um segundo logout.
- `nao-imprime` fica em três lugares: o `aside`, o cabeçalho de marca do celular e o `Dock`. Elemento de chrome novo leva a classe.
- **Gotacha:** `CascaDePagina` faz `if (!usuario) return null` — a casca inteira some sem sessão, inclusive os `children`. A vitrine `/ui` é rota pública e monta a casca na mão, então abre em branco para quem não está logado.

### `cabecalho-de-tela`

Props: `title` (vira o único `h1` da tela), `apoio?` (uma linha sob o título — só se disser algo que o título não diz), `temVoltar?`, `actions?`. O slot `actions` empilha em largura cheia no celular (`*:w-full`) e vira linha no `sm`; passar vários botões ali é o padrão (é o que `RelatorioVisualizacao` faz com CSV/Imprimir/Novo).

### `selo-de-status`

- Um mapa só (`STATUS`) para todos os domínios, chaveado pelo valor cru do banco. Chave repetida entre domínios é a **mesma entrada**: `manutencao` vale para rota e para trem, com um rótulo e uma cor só. Status novo = uma linha no mapa; se o valor já existe em outro domínio, o rótulo/cor dele é herdado.
- `ativo`/`inativo` entraram como status de primeira classe (`inativo` = `secondary`): booleano `ativo` na tela vira `<SeloDeStatus status={ativo ? 'ativo' : 'inativo'} />`, nunca texto "Sim/Não" nem ponto de cor. `programada` é selo preenchido (`default`), não contorno.
- Exporta `rotuloDeStatus(status)`, `opcoesDeStatus(lista)` (`{ valor, rotulo }[]` pronto pra `SelectItem`), `STATUSES` (todas as chaves — é o que a vitrine itera) e `STATUS_DE_VIAGEM`, a tupla de viagem **na ordem em que o filtro exibe** (`as const satisfies readonly ViagemStatus[]`). A tela estreita o `string` do `Select` com `STATUS_DE_VIAGEM.find((item) => item === valor)` em vez de cast.

### `cartao-de-metrica`

`status?` aceita qualquer `Status` e renderiza um `SeloDeStatus` ao lado do rótulo. A bolinha de cor com texto só para leitor de tela **saiu** (regra 7 dos princípios). O valor usa `text-destaque tabular-nums`.

### `cartao-de-usuario`

Mostra situação pelo selo de `ativo`. É botão clicável e levanta 2px no hover — com `motion-safe:`, para respeitar `prefers-reduced-motion`.

### `grafico-de-barras`

- A barra é um `<progress>` nativo, não uma `div` com largura: largura proporcional exigiria `style={{ width }}`, que o lint proíbe. `value` = valor, `max` = maior valor da série (1 se todos forem 0, pra não dividir por zero).
- Como o `<progress>` é nativo, a cor vem por pseudo-elementos do navegador, um par por variante (`[&::-webkit-progress-value]` e `[&::-moz-progress-bar]`), mais `appearance-none` e `[&::-webkit-progress-bar]:bg-transparent` na base. Variante nova de cor = acrescentar os **dois** seletores no `cva`. É por isso que o arquivo usa valor arbitrário (liberado nesta pasta).
- `key={rotulo}`: os rótulos de uma série precisam ser únicos. Série vazia mostra "Sem dados para o gráfico.". Acessibilidade: cada `<progress>` leva `aria-label` com rótulo e valor formatado.

### `lista-de-viagens`

- Uma apresentação só para a viagem (cartões abaixo de `md`, tabela de `md` pra cima), reusada por Rotas e `/viagens`. A prop `acoes?: (viagem) => ReactNode` é o único ponto de variação: com ela aparecem o conteúdo no cartão e a coluna "Ações" na tabela; sem ela a lista é só leitura. Não duplique a lista na página.
- O cartão lidera com o trajeto (`origem → destino`) e põe rota/horários como `dt`/`dd`; a tabela mora dentro de um `Card` (`gap-0 px-2 py-2`) — é o invólucro padrão de tabela em todas as telas.

### `erro-de-carregamento`

`ErroDeCarregamento` é um `Card role="alert"` com ícone, mensagem e botão "Tentar de novo". A prop **`aoTentarDeNovo?: () => void`** é o caminho certo: passe `() => void refetch()` da query. Sem ela o botão faz `window.location.reload()` — recarrega o documento inteiro e perde o cache, então só serve de último recurso. `mensagemDeErro(error)` dá o texto para toast (`detail` da API ou "Sem conexão com o servidor").

### `estado-vazio`

`EstadoVazio` (`icone`, `titulo`, `descricao?`, `acao?`) é o único cartão de lista vazia — mesmo desenho do `ErroDeCarregamento` (`Card items-center gap-3 px-6 text-center`, círculo `size-12`, título `text-xl`, apoio `text-corpo`), com o círculo em `bg-muted` porque vazio não é erro. O `acao` é um `ReactNode` e o componente já dá o `mt-2`: passe o `Button` sem margem. Quem não pode escrever (`podeEscrever`) decide na **tela** se manda `acao` — o componente não conhece papel.

### `acoes-de-linha`

`AcoesDeLinha` (`nome`, `aoEditar`, `aoExcluir`) é o par editar/excluir de linha de tabela e de cartão: dois `Button variant="ghost" size="icon"` (44px) com `Tooltip` e `aria-label` único. `nome` entra no rótulo acessível, então vem com o substantivo do domínio (`` `sensor ${sensor.codigo}` `` → "Editar sensor S-VEL-001"). Sem prop de permissão: a tela só renderiza o componente quando `podeEscrever`.

### `banner-de-erro`

`BannerDeErro` é o `<p role="alert">` em `bg-destructive` das telas de autenticação (login, recuperar senha). Texto como `children`; use `mensagemDeErro(error)` para montar o texto. Erro **de campo** não é isto — é o `FieldError` (ver `danger` × `danger-ink`).

## Rótulo de dado

`text-rotulo font-semibold tracking-wide text-muted-foreground uppercase` é o rótulo de `dt`/legenda e agora tem dono: `rotulo-de-dado.tsx`.

- `RotuloDeDado` é o rótulo sozinho; `como?: 'p' | 'dt'` (padrão `p`) existe porque os usos reais se dividem entre rótulo solto (`p`) e `dl` com valor empilhado embaixo (`dt`). Sem `className`: nenhum chamador precisava.
- `Dado` é o par `dt`/`dd` na mesma linha (`flex items-baseline justify-between`, valor à direita e `tabular-nums`) — a forma que Trens e Sensores duplicavam. Lista com o valor **embaixo** do rótulo (Alertas, CargaLista, `lista-de-viagens`) não usa `Dado`: usa `RotuloDeDado como="dt"` dentro do próprio `div`. Não vire isso numa prop de layout.
- `TableHead` já traz a receita embutida; não embrulhe `RotuloDeDado` nele.

**Adoção concluída (2026-11-09):** nenhuma tela declara mais `classeDeRotulo`, `Vazio`, `Acoes` ou `Dado` local — as quatro peças são a fonte única. Tela nova que precise de rótulo de dado, estado vazio, ações de linha ou banner de erro **consome daqui**; reimplementar na página é o que o refactor veio tirar.

## Vitrine

`src/pages/Vitrine.tsx` (rota `/ui`) foi reescrita junto no refactor e é o catálogo vivo: superfícies, tintas, status, **tipografia por token**, variantes e tamanhos de `Button`/`Badge`, os compostos do domínio e os estados (`EstadoVazio` com e sem `descricao`, `BannerDeErro`, `ErroDeCarregamento` com `aoTentarDeNovo`); `RotuloDeDado`/`Dado` ficam na aba Tokens, ao lado da escala tipográfica, e `AcoesDeLinha` na aba Ações. Ela itera `STATUSES`, então status novo aparece lá sozinho; **variante, prop ou componente novo precisa de seção escrita na mão**. Todo dado dela é exemplo fixo — nada vem da API.

Gotcha: a vitrine monta a `CascaDePagina` na mão e `/ui` é rota pública, mas a casca retorna `null` sem sessão — então `/ui` abre em branco para quem não está logado.
