# Frontend — Design system

> Nasceu na fase 2 do plano [`../tasks/lowh-fundacao-design-system-2026-09-22.md`](../tasks/lowh-fundacao-design-system-2026-09-22.md) (L10, L11, L13, L14) e foi **redesenhado por inteiro em 2026-11-09** ([`../tasks/lowh-refatoracao-ui-2026-11-09.md`](../tasks/lowh-refatoracao-ui-2026-11-09.md)). Contrato visual (lei): [`principios-de-ui.md`](principios-de-ui.md). Tokens e temas: [`tema.md`](tema.md). Vitrine: rota **`/ui`** — reescrita junto, é o catálogo vivo (tokens, tipografia, variantes, compostos e estados), com dado de exemplo fixo. Ela monta a casca na mão, então só abre com sessão.

## Em uma frase

Tudo que desenha vive em `frontend/src/components/ui/`: primitivos do **shadcn/ui** (Radix + Tailwind v4) ajustados pra marca, e compostos do domínio (`CascaDePagina`, `SeloDeStatus`…) montados em cima deles. Página só compõe esses componentes — não tem cor crua, controle cru, `style` nem valor arbitrário (o lint barra).

## Tokens

Vocabulário do shadcn (`background`, `foreground`, `card`, `popover`, `primary`, `secondary`, `muted`, `accent`, `destructive`, `border`, `input`, `ring`, `radius`) + `border-forte`, `overlay`, status (`success`, `warning`, `danger`, `delay`, cada um com `-foreground`), `danger-ink` e a escala tipográfica (`text-rotulo`, `text-corpo`, `text-titulo`, `text-destaque`). Tabela completa com valores claro/escuro em [`tema.md`](tema.md). Regras: fundo `bg-X` → texto `text-X-foreground`; borda sempre com cor explícita (`border-border` ou `border-border-forte`).

## Catálogo

### Primitivos (shadcn, `python3 fsc.py ui add`)

Convenções aplicadas a todos no refactor: pílula (`rounded-full`) em controle, `rounded-lg`/`rounded-xl` em superfície e camada, foco por `outline-2 outline-offset-2 outline-ring`, transição de 150ms `ease-out`, zero `dark:`, camada em `bg-popover`.

| Componente | Arquivo | Uso nas telas | Ajuste de marca |
|------------|---------|---------------|-----------------|
| Button | `button.tsx` | ações de cabeçalho, rodapé de diálogo, vazios | pílula, semibold; `h-11` default e `size-11` no `icon` (44px); sobe 1px no hover e afunda no clique; variantes `default secondary outline ghost link destructive success`; tamanhos `xs sm default lg icon icon-xs icon-sm icon-lg` |
| Input, Label | `input.tsx`, `label.tsx` | todos os formulários e campos de busca | pílula `bg-input` com contorno `border-border-forte`; `aria-invalid` troca a borda por `destructive`; `Label` semibold |
| Field | `field.tsx` | formulários com react-hook-form + zod | `data-invalid` e `FieldError` em `text-danger-ink` (13px, semibold) |
| Select | `select.tsx` | status, cargo, rota, trem, tipo | trigger em pílula igual ao Input; item do menu também em pílula |
| Switch | `switch.tsx` | "rota ativa", termos do cadastro, tema | contorno `border-forte`; 24×44 visual com pseudo-elemento `before:h-11` para o toque chegar a 44px |
| Card | `card.tsx` | cartão de lista, bloco de gráfico, vazio, invólucro de tabela | `rounded-lg`, `border-border`, sem sombra parado; `CardTitle` em `text-xl` |
| Badge | `badge.tsx` | status e marcadores | pílula; variantes `default secondary destructive outline ghost link success warning danger delay` |
| Tabs | `tabs.tsx` | abas Rotas/Viagens | pílulas, ativa em `primary` |
| Dialog, AlertDialog | `dialog.tsx`, `alert-dialog.tsx` | cadastro/edição e confirmação destrutiva | `bg-popover`, `rounded-xl`, botão de fechar em pílula, textos em português ("Fechar") |
| Sheet | `sheet.tsx` | folha de menu do celular (todas as seções) | `bg-popover`, canto arredondado no lado que entra, 200ms |
| Table | `table.tsx` | toda lista a partir de `md` (ou `lg` na carga) | `TableHead` já é o rótulo (13px, semibold, caixa alta, `muted-foreground`); zebra `even:bg-muted/40`; linha com `border-border` |
| Sonner (Toaster) | `sonner.tsx` | toasts de sucesso/erro | tema lido de `@/contexts/Tema` |
| Avatar | `avatar.tsx` | foto de usuário e do perfil | — |
| Skeleton | `skeleton.tsx` | carregamento com a forma do conteúdo | `bg-muted`, `rounded-lg` |
| Tooltip | `tooltip.tsx` | ações de ícone nas tabelas, texto truncado | `bg-foreground`, sombra |
| Separator | `separator.tsx` | nenhuma tela: existe porque o `FieldSeparator` do `field.tsx` o importa (as telas separam com espaço ou com `border-t border-border`) | — |

### Compostos do domínio

| Componente | Arquivo | O que faz |
|------------|---------|-----------|
| `CascaDePagina` | `casca-de-pagina.tsx` | Casca das telas logadas. Barra lateral fixa de `lg` pra cima (marca, navegação em grupos, e no rodapé: nome/cargo, alternador de tema e "Sair da conta"); abaixo disso, cabeçalho de marca + dock em pílula fixa embaixo com os itens marcados `dock` do papel e o botão Menu, que abre a folha com todos os grupos. `main` centrado em `max-w-5xl`. |
| `LayoutDeAutenticacao` | `layout-de-autenticacao.tsx` | Layout das telas de auth: logo + cartão arredondado no mobile; coluna 45% + foto no desktop, com o conteúdo em `max-w-md`. Props `title`, `description?`. |
| `CabecalhoDeTela` | `cabecalho-de-tela.tsx` | O `h1` da tela, `apoio?` (uma linha sob o título), `temVoltar?` e slot `actions` (largura cheia no celular, linha no `sm`). |
| `SeloDeStatus` | `selo-de-status.tsx` | Status do banco → rótulo/cor: rota (`na_estacao ja_partiu atraso manutencao fechado`), trem (`ativo manutencao parado`), leitura de sensor (`normal alerta falha`), severidade de alerta (`normal atencao critico`), viagem (`programada em_andamento atrasada concluida cancelada`) e situação de cadastro (`ativo inativo`). Exporta o tipo `Status`, `rotuloDeStatus`, `opcoesDeStatus`, `STATUSES` e a tupla `STATUS_DE_VIAGEM`. |
| `CartaoDeMetrica` | `cartao-de-metrica.tsx` | Indicador do dashboard: ícone em quadrado `primary`, rótulo de 13px, número em `text-destaque tabular-nums` e `SeloDeStatus` opcional. |
| `CartaoDeUsuario` | `cartao-de-usuario.tsx` | Cartão clicável do grid de usuários: foto, nome, cargo, selo de situação; levanta 2px no hover (`motion-safe:`). |
| `GraficoDeBarras` | `grafico-de-barras.tsx` | Barras horizontais proporcionais ao maior valor (gráfico em CSS, decisão E2), uma por item `{ rotulo, valor, variant? }`; `formatar` opcional. Usado no dashboard e nos relatórios. |
| `ListaDeViagens` | `lista-de-viagens.tsx` | Lista de viagens: cartões no celular (trajeto na frente, horários em `dt`/`dd`), tabela dentro de `Card` a partir de `md`. A prop `acoes?(viagem)` desenha a coluna/linha de ações; sem ela a lista é só leitura. Usado em Rotas (aba Viagens) e em `/viagens`. |
| `AlternadorDeTema` | `alternador-de-tema.tsx` | Switch claro/escuro com sol/lua. |
| `CampoDeSenha` | `campo-de-senha.tsx` | Input de senha com mostrar/ocultar (botão de 44px dentro do campo). |
| `ErroDeCarregamento` | `erro-de-carregamento.tsx` | Estado de erro de query: `Card role="alert"` com ícone, mensagem e "Tentar de novo". Passe `aoTentarDeNovo={() => void refetch()}`; sem a prop o botão recarrega o documento. Exporta `mensagemDeErro(error)` pro texto de toast. |
| `EstadoVazio` | `estado-vazio.tsx` | Cartão de lista vazia, no mesmo desenho do `ErroDeCarregamento` (círculo em `bg-muted`, porque vazio não é erro): `icone` (ícone lucide), `titulo`, `descricao?` e `acao?` (o `Button` que resolve — o componente já dá o espaçamento). Quem não pode escrever simplesmente não passa `acao`. |
| `RotuloDeDado` / `Dado` | `rotulo-de-dado.tsx` | O rótulo de 13px em caixa alta, com dono: `RotuloDeDado` é o rótulo sozinho (`como?: 'p' \| 'dt'`), `Dado` é o par rótulo/valor na mesma linha (valor à direita, `tabular-nums`) usado dentro de `dl`. Lista com valor empilhado embaixo do rótulo usa `RotuloDeDado como="dt"` direto. |
| `AcoesDeLinha` | `acoes-de-linha.tsx` | Par editar/excluir de linha de tabela e de cartão: dois botões-ícone de 44px com `Tooltip` e `aria-label` único (`nome` vem com o substantivo do domínio: `sensor S-VEL-001`). Props `nome`, `aoEditar`, `aoExcluir`; permissão fica na tela. |
| `BannerDeErro` | `banner-de-erro.tsx` | Faixa `role="alert"` em `bg-destructive` das telas de autenticação (erro de login, falha ao recuperar senha). Texto como `children`. Erro de campo continua sendo `FieldError`. |
| `BotaoDeSair` | `casca-de-pagina.tsx` | "Sair da conta": chama `sair.mutate` e avisa por toast se falhar. Sem props. Exportado para não existir um segundo logout escrito à mão. |

## Como montar uma tela

0. **Leia [`principios-de-ui.md`](principios-de-ui.md)** — especialmente a seção 0 (as dez regras) e a 3 (a ordem dos blocos de uma tela). Ela manda mais que este catálogo.
1. Página em `src/pages/**/*.tsx`, importando só de `@/components/ui/*` (e libs), sempre por `@/`.
2. Tela logada: **não** embrulhe em `<CascaDePagina>` — o `LayoutProtegido` do `Aplicacao.tsx` já envolve toda rota logada. Comece com `<CabecalhoDeTela title="…" apoio="…" actions={…} />`. Tela de auth: `<LayoutDeAutenticacao title="…">`. Só a vitrine `/ui` monta a `CascaDePagina` na mão.
3. Layout mobile-first com utilitários, cor só por token. A ordem padrão: cabeçalho → resumo (métricas) → filtro/busca → conteúdo → camadas.
4. **Conteúdo é tabela no desktop e cartões no celular, nunca rolagem lateral.** O corte é `md` em quase tudo (`lg` na carga, que tem sete colunas). A tabela vai dentro de um `Card className="hidden gap-0 px-2 py-2 md:block"`; os cartões são `<ul>` com `md:hidden`.
5. **Os três estados são tela também**: carregando com `Skeleton` na forma do conteúdo (altura de cartão no celular, de linha no desktop), erro com `ErroDeCarregamento` + `refetch`, e vazio com `EstadoVazio` (ícone do domínio, frase do que aquilo significa e o botão que resolve). Quando a lista tem filtro, o vazio tem **duas** versões: "nada bate com o filtro" (ação: limpar filtros) e "nada cadastrado" (ação: cadastrar o primeiro).
6. Formulário: `useForm({ resolver: zodResolver(esquema) })` + `<Controller>` renderizando `<Field data-invalid>` / `<FieldLabel>` / controle com `aria-invalid` / `<FieldError errors={[fieldState.error]} />`. Rótulo sempre visível; `placeholder` só como exemplo.
7. Cadastro e edição abrem em `Dialog` sobre a lista (`max-h-dvh overflow-y-auto`); confirmação destrutiva em `AlertDialog` com verbo explícito no botão ("Excluir sensor", nunca "OK"). Feedback: `toast()` do `sonner`. `422` da API: `if (tratouErrosDeCampo(erro, formulario)) return`.
8. Ação por linha é botão de ícone `ghost` com `aria-label` ("Editar Ana Souza") e `Tooltip`. Nome em lista **não** é link.
9. Texto da tela que vira rótulo vem de `src/lib/rotulos.ts`; formatação vem de `src/lib/utils.ts` (`dataHora`, `dataBrasileira`, `formatarNumero`). Número em tabela e métrica leva `tabular-nums`.
10. Faltou algo? Primitivo novo → `python3 fsc.py ui add <nome>`; padrão do domínio que se repete → composto novo em `ui/` (+ seção na vitrine). Nunca estilo solto na página.
11. Confira a tela em **390px e 1440px**, nos **dois temas**, item por item contra a seção 0 dos princípios. Não há teste de front (L27).

## Legado

Não existe mais: os `src/components/<Nome>/*.jsx` foram apagados no fechamento da fase 4 (D5). O visual anterior a 2026-11-09 também não serve de referência — foi descartado de propósito (decisão F7). Telas por área: [`telas/`](telas/).
