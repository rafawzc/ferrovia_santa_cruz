# Frontend — Sistema de temas (claro/escuro)

> Tokens no **vocabulário do shadcn/ui** desde a fase 2 (2026-09-22). A paleta desta página foi **toda refeita em 2026-11-09** (refactor total da UI): o *porquê* de cada cor, com os contrastes medidos, está em [`principios-de-ui.md`](principios-de-ui.md) — esta página é a tabela de consulta. Catálogo de componentes: [`design-system.md`](design-system.md). Regra semântica e histórico de bugs: [`tema-escuro.md`](tema-escuro.md).

## Como funciona (deadly simple)

```
Tema (contexto)  →  <html class="claro">   →  :root    define --primary: #6d412a   →  bg-primary = #6d412a
                 →  <html class="escuro">  →  .escuro  redefine --primary: #c4a27d →  bg-primary = #c4a27d
```

- `src/contexts/Tema.tsx` guarda o tema no `localStorage` (`tema` = `claro`/`escuro`) e põe `claro` ou `escuro` no `<html>`. `useTema()` devolve `{ escuro, alternarTema }`. O botão é `AlternadorDeTema` de `@/components/ui/alternador-de-tema` — no deslogado ele fica flutuando no canto (`LayoutPublico` do `Aplicacao.tsx`); no logado, no rodapé da barra lateral e da folha de menu da `CascaDePagina`.
- `index.html` já nasce com `class="claro"`. Sem anti-FOUC: quem salvou `escuro` vê um instante do claro até o React montar.

## Onde os tokens moram

Tudo em `frontend/src/index.css`:

```css
@custom-variant dark (&:where(.escuro, .escuro *));

@theme inline {
  --color-primary: var(--primary);
}

:root   { --primary: #6d412a; }
.escuro { --primary: #c4a27d; }
```

- **`:root`** tem o tema claro (vale mesmo sem classe); **`.escuro`** sobrescreve. Desde 2026-11-09 **todos** os tokens de cor são redeclarados no `.escuro`, inclusive os de status: eles mudam de tom entre os temas para manter contraste contra `card`/`background` de cada um.
- **`@theme inline`** faz o Tailwind gerar `bg-primary`, `text-muted-foreground`… apontando direto pra variável. Cor definida direto em hex (com alpha em hex8 quando precisa, ex. `--overlay: #44312b99`). **Não existe mais o truque de canais RGB.**
- **Opacidade** (`bg-primary/20`) funciona: o v4 aplica alpha com `color-mix()` na cor final.
- **`dark:`** continua declarado e casando com `.escuro`, mas **nenhum arquivo do `src/` usa**: o token já muda sozinho. Só volte a usar se o token não resolver.
- **Borda**: `border`/`border-b` do v4 definem só espessura — a cor padrão é `currentColor`, não `--border`. Sempre explicite `border-border` (divisória) ou `border-border-forte` (contorno de controle).
- **Radius:** `--radius: 1.25rem` (20px). `rounded-lg` = 20px, `rounded-xl` = 24px, `rounded-md` = 18px, `rounded-sm` = 16px. `rounded-full` é a assinatura do mockup em botão, selo, campo, item de select, aba e navegação.
- **Fonte:** `--font-poppins` (`font-poppins`); o `body` já usa Poppins e declara `background-color`/`color` pelos tokens.
- **Token novo:** valor em `:root` (e em `.escuro` se muda) + `--color-<nome>: var(--<nome>);` no `@theme inline` + linha no bloco `@media print` se a tela imprimível puder usá-lo.

## Tokens de cor

| Token | Papel | Claro | Escuro |
|-------|-------|-------|--------|
| `background` / `foreground` | fundo da página / tinta padrão | `#daccbe` / `#44312b` | `#1b1410` / `#eae6de` |
| `card` / `card-foreground` | superfície de cartão e de tabela | `#c2b19c` / `#44312b` | `#2a201a` / `#eae6de` |
| `popover` / `popover-foreground` | camada flutuante: diálogo, folha, select aberto, toast | `#eae6de` / `#44312b` | `#332720` / `#eae6de` |
| `primary` / `primary-foreground` | ação principal, item de navegação ativo, marca | `#6d412a` / `#eae6de` | `#c4a27d` / `#2a201a` |
| `secondary` / `secondary-foreground` | ação secundária, superfície elevada, selo neutro | `#eae6de` / `#44312b` | `#3d2f26` / `#eae6de` |
| `muted` / `muted-foreground` | zona neutra (zebra de tabela, esqueleto, ícone de vazio) / texto de apoio | `#cfbda9` / `#524237` | `#241b16` / `#c2b19c` |
| `accent` / `accent-foreground` | realce: hover de navegação, item selecionado | `#c4a27d` / `#44312b` | `#6d412a` / `#eae6de` |
| `border` | divisória decorativa (cartão, linha de tabela, camada) | `#b29b84` | `#4a3a2e` |
| `border-forte` | contorno de controle (campo, select, switch, botão `outline`) — ≥ 3:1 | `#6f5c4a` | `#8b6c56` |
| `input` | fundo de campo | `#eae6de` | `#241b16` |
| `ring` | anel de foco (2px, `outline-offset-2`) | `#6d412a` | `#c4a27d` |
| `overlay` | véu atrás de diálogo/folha | `#44312b99` | `#0d0907cc` |
| `success` / `-foreground` | normal, ativo, concluído | `#4a6b3f` / `#eae6de` | `#8fae7e` / `#2a201a` |
| `warning` / `-foreground` | atenção, pendente, manutenção | `#895f1c` / `#eae6de` | `#d9a94e` / `#2a201a` |
| `danger` / `-foreground` | crítico, falha, exclusão (preenchimento) | `#a33726` / `#eae6de` | `#e08575` / `#2a201a` |
| `danger-ink` | **texto** de erro (o `danger` não atinge 4.5:1 como texto sobre `card` no claro) | `#7e2a1d` | `#e08575` |
| `delay` / `-foreground` | atraso (termo do domínio) | `#8a4a1c` / `#eae6de` | `#d1864a` / `#2a201a` |
| `destructive` / `-foreground` | nome que os primitivos shadcn esperam; **repete o hex de `danger`** (é cópia, não `var(--danger)`) | `#a33726` / `#eae6de` | `#e08575` / `#2a201a` |

As seis âncoras do guia de estilo da Entrega 1 (`#44312b`, `#6d412a`, `#c4a27d`, `#c2b19c`, `#daccbe`, `#eae6de`) continuam valendo; o resto é derivado e **medido**, não escolhido no olho. Os números de contraste de cada par estão em [`principios-de-ui.md`](principios-de-ui.md) (seções 1 e 2).

Status **sempre** aparece como selo preenchido com rótulo — nunca texto colorido nem ponto de cor. A razão é medida: sobre `card` (`#c2b19c`) nenhum tom de status chega a 4.5:1 como texto, mas todos passam como preenchimento com a tinta clara em cima.

## Escala tipográfica

Também no `@theme inline`, para a tela não escolher pixel na mão:

| Token | Valor | Onde |
|---|---|---|
| `text-rotulo` | 13px | rótulo de dado (`dt`), cabeçalho de tabela, texto de apoio |
| `text-corpo` | 15px | corpo e célula |
| `text-titulo` | 28px | `h1` da tela no celular |
| `text-destaque` | 32px | `h1` no desktop (`lg:text-destaque`) e número de métrica |

Título de seção (cartão, diálogo, folha) é `text-xl` + `font-semibold`, já embutido em `CardTitle`, `DialogTitle`, `AlertDialogTitle` e `SheetTitle`.

## Movimento

No `@layer base`: transição global de 150ms `ease-out` em `color, background-color, border-color, box-shadow, transform`; camadas (diálogo, folha, select) entram em 200ms. Um bloco `@media (prefers-reduced-motion: reduce)` zera animação, transição e `scroll-behavior` — não contorne.

## Impressão

O `@media print` do `index.css` redefine **todos** os tokens de cor para preto, branco e cinza (e o `.nao-imprime` esconde o chrome). Por que ele fica fora de `@layer` e o que mais saber: [`../../frontend/CLAUDE.md`](../../frontend/CLAUDE.md), seção *Impressão*.

## De → para (codemod da fase 2)

Os `.jsx` legados foram migrados por codemod com esse mapa. Serve só para ler commit antigo — nenhum desses nomes existe mais no código.

| Antigo | Novo | Observação |
|--------|------|------------|
| `texto1` | `foreground` | `text-texto1` → `text-foreground` |
| `texto2` | `primary-foreground` | texto sobre a cor de marca |
| `componente1` | `primary` | também `ring` (foco) |
| `componente3` | `secondary` | |
| `componente4` | `accent` | também `popover` |
| `bg-base` | `muted` | `bg-bg-base` → `bg-muted` |
| `bg-page` | `background` | `bg-bg-page` → `bg-background` |
| `bg-card` | `card` | `bg-bg-card` → `bg-card` |
| `input-bg` | `input` | `bg-input-bg` → `bg-input` |
| `overlay` | `overlay` | agora hex8, igual papel |
| `border` | `border` | hoje dividido em `border` e `border-forte` |
| `error` | `destructive` | texto de erro hoje é `danger-ink` |
| `success` | `success` | o hex mudou de novo em 2026-11-09 (dessaturado pro clima sépia) |
| `yellow-400/500/600` soltos | `warning` | |
| `orange-400` solto | `delay` | |
| `red-400` (status) | `danger` | |
| `green-400` / `green-100/300/700` | `success` | |

## Pendente

- Anti-FOUC (tema escuro salvo pisca claro no carregamento).
