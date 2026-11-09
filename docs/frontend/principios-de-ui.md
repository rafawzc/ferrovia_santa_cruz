# Princípios de UI — contrato do refactor

Este arquivo é **lei** para qualquer pessoa ou agente que desenhe tela neste projeto. Ele existe porque a UI foi refeita de cabo a rabo em 2026-11-09 e o resultado só se sustenta se todo mundo seguir o mesmo sistema. **Não use o código anterior como exemplo de estética** — ele foi substituído de propósito. Use este documento, o guia de estilo (`docs/design/guia-de-estilo/`) e os mockups (`docs/design/mobile/`, `docs/design/desktop/`).

Destilado do *tasteskill* (skill de gosto visual, usado uma vez e removido) **adaptado para app logado**. O que foi descartado de propósito: hero, uma seção por tela, fotografias, moments, shaders, cenas, footer de marketing. Isso é vocabulário de landing page de empresa; aqui é painel de operação ferroviária. O que foi mantido é a parte que vale em qualquer interface: **um sistema só, bordas alinhadas, hierarquia real, movimento discreto, e verificação em navegador de verdade**.

## 0. As dez regras que ganham de tudo

1. **Um sistema só.** Um par de botões (primário/secundário), um estilo de cartão, uma escala de raio, um jeito de link, uma escala de título. Se a tela precisa de um botão que não existe, o problema é a tela.
2. **Bordas alinhadas.** Tudo numa tela começa e termina nas mesmas duas colunas. Nada escapa para um lado. Zero rolagem horizontal, inclusive em 320px.
3. **No máximo duas caixas de profundidade.** Cartão dentro de cartão dentro de cartão é desalinhamento garantido. Agrupe com espaço e tipografia, não com mais molduras.
4. **Espaço é hierarquia.** O que é do mesmo assunto fica perto; o que muda de assunto ganha ar. Tela apertada e tela esparsa são o mesmo erro com sinais trocados.
5. **Toda ação responde ao ponteiro.** Botão sobe no hover e afunda no clique, cartão clicável levanta 2px, link sublinha. Nada inclina, nada pisca, nada entra por causa de scroll.
6. **Um só assunto principal por tela**, dito em um título que nomeia coisa do domínio. Ação principal visível sem rolar.
7. **Estado nunca é só cor.** Status tem forma + rótulo. Nunca um ponto colorido sozinho.
8. **Mobile é a primeira composição, não a sobra.** Começa em 390px e sobe. Alvo de toque ≥ 44px, botão principal em largura cheia no celular.
9. **Claro e escuro são a mesma tela.** Toda tela é conferida nos dois temas antes de ser dada como pronta.
10. **Vazio, carregando e erro são tela também.** Toda lista tem os três desenhados — nunca uma área em branco.

## 1. Identidade: sépia retrô ferroviário

A estética vem do guia de estilo da Entrega 1: **sépia quente, cantos muito arredondados, emblema de locomotiva, Poppins**. Lê-se como bilhete de trem antigo, não como SaaS genérico. Isso significa: formas generosas e redondas, cor terrosa, contraste alto entre tinta marrom-escura e superfície clara, e nada de cinza-azulado, nada de violeta, nada de neon.

### `primary` não é `marca`

Dois papéis que no tema claro têm a mesma cor e por isso se confundem: **ação** (botão, aba ativa, switch ligado, barra de progresso) e **identidade** (cartão de usuário, quadrado do ícone de métrica, emblema da ferrovia, painel da tela de login). No escuro a ação vira dourado — e se a identidade seguir junto, o cartão de usuário inverte para um bloco claro, que o mockup não tem. Por isso `marca` é marrom nos dois temas, enquanto `primary` acompanha o tema.

### Cores — as seis âncoras são inegociáveis

Do `docs/design/guia-de-estilo/paleta-de-cores.png`:

| Papel no guia | Hex | Uso no sistema |
|---|---|---|
| Texto 1 | `#44312b` | tinta principal, texto sobre claro |
| Componente 1 | `#6d412a` | marrom de ação: botão primário, cabeçalho de painel, barra de navegação |
| Componente 2 | `#c4a27d` | dourado de destaque: realce, seleção, acento no escuro |
| Componente 3 | `#c2b19c` | superfície de cartão no claro |
| Componente 4 | `#daccbe` | fundo da página no claro |
| Texto 2 | `#eae6de` | texto sobre marrom, superfície elevada |

Tudo o mais é **derivado** delas e já está resolvido na tabela de tokens (seção 2). Ninguém inventa cor nova na tela: **cor só existe em `src/index.css`** (o lint barra hex e classe de paleta em qualquer outro arquivo).

### Forma

- **Raio**: pílula completa em navegação, abas, selos e botões pequenos; `1rem`–`1.5rem` em cartões, campos e diálogos. Nada de canto reto, nada de raio intermediário aleatório.
- **Borda**: fina e de baixo contraste, só onde separa superfícies de luminância parecida. Borda não é decoração.
- **Elevação**: sombra discreta e quente, só em coisa que de fato flutua (diálogo, menu, dock, cartão em hover). Cartão parado em lista não tem sombra.

### Tipografia — Poppins, uma escala só

A escala é token, não pixel escolhido na hora: `text-rotulo` (13px), `text-corpo` (15px), `text-titulo` (28px) e `text-destaque` (32px) vivem no `@theme inline` do `src/index.css`.

| Papel | Token / peso | Onde |
|---|---|---|
| Título de tela | `text-titulo` → `lg:text-destaque`, 700 | uma vez por tela (`CabecalhoDeTela` já faz) |
| Título de seção | `text-xl`, 600 | cabeçalho de cartão, diálogo e folha (já embutido nos primitivos) |
| Rótulo de dado | `text-rotulo`, 600, caixa alta, `tracking-wide`, `muted-foreground` | legenda de métrica, `dt` de cartão, cabeçalho de tabela (`TableHead` já faz) |
| Corpo | `text-corpo`, 400 | texto e célula |
| Número de destaque | `text-destaque`, 700, `tabular-nums` | métrica de painel, número de rota |
| Apoio | `text-rotulo`, 400 | ajuda e texto secundário |

Nunca mais de três tamanhos num mesmo bloco. Número em tabela e em métrica usa variante tabular para as colunas baterem.

## 2. Tokens — a fonte única

Todos vivem em `src/index.css` (`:root` para o claro, `.escuro` para o escuro) e são expostos ao Tailwind no `@theme inline`. **Nome de token em português** não se aplica aqui: o vocabulário shadcn (`background`, `primary`, `muted`…) é contrato de terceiro e fica como está (ver `frontend/CLAUDE.md`).

### Claro

A página é a cor mais clara do guia e o cartão é o tom médio — é a relação do mockup (painel mais escuro sobre papel mais claro), mas com separação medida de 1.68:1 em vez dos 1.33:1 que a primeira versão tinha. Camada flutuante (diálogo, menu) usa o tom de areia, para não se confundir nem com a página nem com o cartão.

| Token | Hex | Papel |
|---|---|---|
| `background` | `#eae6de` | fundo da página |
| `foreground` | `#44312b` | tinta |
| `card` | `#c2b19c` | superfície de cartão |
| `card-foreground` | `#44312b` | tinta sobre cartão |
| `popover` | `#daccbe` | diálogo, menu, folha |
| `popover-foreground` | `#44312b` | tinta sobre eles |
| `primary` | `#6d412a` | ação principal, cabeçalho de painel |
| `marca` | `#6d412a` | **superfície de identidade** — cartão de usuário, quadrado do ícone de métrica, emblema, painel da autenticação |
| `primary-foreground` | `#eae6de` | tinta sobre marrom |
| `secondary` | `#daccbe` | ação secundária |
| `secondary-foreground` | `#44312b` | tinta sobre ela |
| `accent` | `#c4a27d` | realce, item selecionado, foco de lista |
| `accent-foreground` | `#44312b` | tinta sobre o dourado |
| `muted` | `#cfbda9` | zona neutra dentro de cartão, linha zebrada |
| `muted-foreground` | `#524237` | texto de apoio (6.09:1 no fundo, 4.59:1 no cartão) |
| `border` | `#b29b84` | divisória suave, decorativa |
| `border-forte` | `#6f5c4a` | contorno de controle (campo, select, switch): 3.04:1 no cartão |
| `destructive` | = `danger` (`#a33726`) | nome que os primitivos shadcn esperam; é **cópia** do hex de `danger`, não `var(--danger)` — mexeu num, mexa no outro |
| `danger-ink` | `#7e2a1d` | `danger` como **texto** (erro de campo): o `#a33726` não chega a 4.5:1 sobre `card` |
| `input` | `#f3efe9` | fundo de campo (mais claro que tudo: campo sempre lê como "escrevível") |
| `ring` | `#6d412a` | anel de foco |
| `overlay` | `#44312b99` | véu atrás de diálogo |

### Escuro

| Token | Hex | Papel |
|---|---|---|
| `background` | `#110c09` | fundo |
| `foreground` | `#eae6de` | tinta |
| `card` | `#2a201a` | cartão |
| `card-foreground` | `#eae6de` | tinta sobre cartão |
| `popover` | `#332720` | diálogo e menu |
| `popover-foreground` | `#eae6de` | tinta sobre eles |
| `primary` | `#c4a27d` | ação principal (o dourado vira a ação no escuro) |
| `marca` | `#6d412a` | superfície de identidade — **não acompanha o `primary`**, continua marrom nos dois temas |
| `primary-foreground` | `#2a201a` | tinta sobre o dourado |
| `secondary` | `#3d2f26` | ação secundária |
| `secondary-foreground` | `#eae6de` | tinta sobre ela |
| `accent` | `#6d412a` | realce |
| `accent-foreground` | `#eae6de` | tinta sobre o realce |
| `muted` | `#241b16` | zona neutra |
| `muted-foreground` | `#c2b19c` | texto de apoio |
| `border` | `#4a3a2e` | divisória suave, decorativa |
| `border-forte` | `#8b6c56` | contorno de controle: 3.79:1 no fundo, 3.32:1 no cartão, 3.01:1 no popover |
| `input` | `#241b16` | fundo de campo |
| `ring` | `#c4a27d` | anel de foco |
| `overlay` | `#0d0907cc` | véu |
| `danger-ink` | `#e08575` | texto de erro — no escuro vale o mesmo que `danger` |
| `destructive` | `#e08575` | cópia de `danger`, como no claro |

### Status — derivados, terrosos, nunca puros

Verde/amarelo/vermelho de biblioteca brigam com o sépia. Os de status são dessaturados para o mesmo clima, e **cada um sempre aparece com rótulo e forma**, nunca só pela cor.

Status **sempre aparece como selo preenchido com rótulo** — nunca como texto colorido sobre a superfície, nunca como ponto de cor. A razão é medida: sobre `card` (`#c2b19c`) nenhum destes tons chega a 4.5:1 como texto, mas todos passam como preenchimento com a tinta clara em cima.

| Token | Claro | `-foreground` claro | Escuro | `-foreground` escuro | Significado |
|---|---|---|---|---|---|
| `success` | `#4a6b3f` | `#eae6de` (4.87:1) | `#8fae7e` | `#2a201a` (6.46:1) | normal, ativo, concluído |
| `warning` | `#895f1c` | `#eae6de` (4.54:1) | `#d9a94e` | `#2a201a` (7.38:1) | atenção, pendente |
| `danger` | `#a33726` | `#eae6de` (5.39:1) | `#e08575` | `#2a201a` (5.90:1) | crítico, falha, exclusão |
| `delay` | `#8a4a1c` | `#eae6de` (5.48:1) | `#d1864a` | `#2a201a` (5.47:1) | atraso (termo do domínio) |

No `@media print` todos viram preto/cinza — a cor deixa de significar status no papel, e é por isso que o rótulo é obrigatório.

### Escala de raio, espaço e movimento

- Raio: `--radius: 1.25rem` como base. **Pílula completa (`full`) em botão, selo, campo, item de select, aba e navegação** — é a assinatura retrô do mockup. `lg` em cartão, `xl` em diálogo e painel. Não existe canto reto nem raio intermediário escolhido a olho.
- Espaço: múltiplos de 4px. Dentro de um bloco: 8/12/16. Entre blocos: 24 mobile, 32 desktop. Margem lateral da página: 16 mobile, 24 tablet, 32 desktop, com largura máxima de conteúdo para a linha de texto não esticar.
- Movimento: 150ms para hover e press, 200ms para entrada de camada, `ease-out`. **Nada acima de 300ms.** Tudo respeita `prefers-reduced-motion` (sem movimento, sem conteúdo escondido).

## 3. Como uma tela é montada

Toda tela logada vive dentro da casca (`casca-de-pagina.tsx`) e tem, nesta ordem:

1. **Cabeçalho de tela**: título que nomeia a coisa, uma linha de apoio só se ela disser algo que o título não diz, e a ação principal à direita (no celular, abaixo, em largura cheia).
2. **Resumo**, quando a tela tem números que orientam a decisão: faixa de métricas em pílula, no máximo quatro.
3. **Filtro/busca**, quando a lista passa de ~10 itens, na mesma linha de borda do conteúdo.
4. **Conteúdo**: tabela no desktop, cartões no celular — a mesma informação, nunca duas verdades diferentes.
5. **Camadas**: cadastro e edição abrem em diálogo sobre a lista (já é o padrão do projeto); confirmação destrutiva em `alert-dialog` com verbo explícito no botão ("Excluir sensor", nunca "OK").

### Tabela

Cabeçalho fixo em rolagem longa, zebra em `muted`, ação por linha à direita e sempre com nome acessível, alinhamento numérico à direita com variante tabular, truncamento com tooltip em vez de quebrar a coluna. No celular a tabela **não** vira rolagem lateral: vira lista de cartões.

### Formulário

Rótulo sempre visível (nunca só `placeholder`), erro sob o campo, campo errado com borda `danger` **e** texto, uma coluna no celular, duas no desktop só quando os campos são irmãos curtos (cidade/UF). Botão primário à direita no desktop, largura cheia no celular, e desabilitado só enquanto envia.

### Vazio, carregando, erro

- **Vazio**: ícone do domínio, uma frase do que isso significa e o botão que resolve ("Cadastrar primeiro trem").
- **Carregando**: esqueleto com a forma do conteúdo que vem, nunca um spinner solto no meio da página.
- **Erro**: usa `ErroDeCarregamento` com a mensagem da API e um "Tentar de novo".

## 4. Texto da interface

- Título nomeia substantivo do domínio ("Sensores da linha"), nunca "Gerenciamento de dados".
- Botão é **verbo + objeto**: "Cadastrar sensor", "Exportar CSV", "Salvar alterações". Nunca "Enviar", "OK", "Confirmar" sozinhos.
- Sem enchimento: nada de "poderoso", "simplesmente", "robusto", "basta", "experiência". Sem exclamação. Sem emoji.
- Mensagem de erro diz o que fazer, não pede desculpa.
- Número com unidade e escala legíveis (`1.284 t`, `32 °C`), data em `dataHora`/`dataBrasileira` (já existem em `lib/utils`).
- Português do Brasil, com acento correto, em tudo que o usuário lê.

## 5. Acessibilidade — barra fixa

- Contraste AA: 4.5:1 em texto, 3:1 em ícone e borda que carrega significado. Nos dois temas.
- Todo controle tem nome acessível; ícone sozinho leva rótulo.
- Foco visível em tudo que recebe foco, com o anel do token `ring` e 2px de afastamento — nunca removido.
- Ordem de título sem pular nível; um `h1` por tela.
- Alvo de toque ≥ 44px fora de texto corrido.
- Diálogo prende o foco, fecha no `Esc` e devolve o foco a quem abriu (os primitivos já fazem — não quebre).

## 6. Regras do projeto que o refactor não pode furar

Isto é imposto por lint; furou, o `check` fica vermelho (detalhe em `frontend/CLAUDE.md`).

- **Zero comentário em código.** O porquê mora neste arquivo e nos `CLAUDE.md`.
- **Nada de cor crua** (hex, `rgb(`, `bg-red-500`) fora de `src/index.css`.
- **Nada de valor arbitrário** do Tailwind (`rounded-[3rem]`) fora de `components/ui/`. Precisa de um valor novo? Vira token. O 13px de rótulo já é o token `text-rotulo`.
- **Nada de `style={{}}`.**
- **Controle HTML cru** (`<button>`, `<input>`, `<select>`, `<textarea>`, `<dialog>`) só dentro de `components/ui/`.
- **Nomes em português** para tudo que escrevemos; `ao` em vez de `on` nas nossas props de callback.
- **Página não chama `fetch` nem `api.*`**: usa hook de `src/hooks/`. Nenhum comportamento de dados muda neste refactor.
- Página não importa `@radix-ui/*` nem outra página.

## 7. O que nunca entra

- Cartão, linha ou bloco que aparece por causa de scroll; parallax; carrossel; aba que troca sozinha.
- Inclinação, sombra dura, gradiente chamativo, vidro fosco, neon.
- Violeta, lavanda, azul corporativo, cinza frio — fora da família sépia.
- Ícone desenhado à mão imitando marca real; ícone decorativo que não ajuda a ler a tela.
- Dois jeitos de fazer a mesma coisa (dois estilos de botão para a mesma importância, dois cartões diferentes na mesma lista).
- Texto explicando a interface ("clique no botão abaixo para...").
- Dado inventado na tela para "ficar bonito": o que não vem da API não aparece.

## 8. Como se prova que ficou pronto

Nenhuma tela é declarada pronta sem isto, nesta ordem:

1. `python3 fsc.py lint fe`, `python3 fsc.py typecheck` e `python3 fsc.py npm run build` verdes.
2. Tela aberta no navegador em **390px e 1440px**, nos **dois temas**, com a conta de dev (`ana.admin@ferrovia.com` / `ferrovia123`).
3. Conferido contra a seção 0 deste arquivo, item por item: bordas alinhadas, profundidade ≤ 2, foco visível, alvo de 44px, nada vazando em 320px, vazio/carregando/erro desenhados.
4. Relatório diz o que foi verificado e o que não foi.

Verificação é no navegador, com os olhos. O front não tem teste automático (decisão L27) — por isso o passo 2 não é opcional.
