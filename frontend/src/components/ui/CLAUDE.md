# components/ui/ — o design system inteiro

Primitivos shadcn **e** compostos do domínio moram juntos aqui (L11). Página só compõe o que está aqui. Catálogo e passo a passo de tela: `docs/frontend/design-system.md`. Tokens: `docs/frontend/tema.md`.

## Adicionar primitivo shadcn

```bash
./fsc ui add <nome> [-y]      # da raiz do repo; roda o CLI e depois eslint --fix aqui (tira comentários)
./fsc npm run format          # limpa as linhas em branco que o fix deixa
./fsc lint fe                 # tem que passar
```

Depois do add, conserte na mão o que o lint pegar. Os casos já vistos:

- **`import { cn } from "cn"`**: o registry do shadcn passou a gerar isso (pacote npm `cn`, 2026-09) e instala a dep `cn`. Troque por `@/lib/utils` (`sed -i 's#from "cn"#from "@/lib/utils"#' src/components/ui/*.tsx`) e `./fsc npm uninstall cn`. O lint barra `cn` e `next-themes` aqui.
- `bg-black/50` do overlay → `bg-overlay`. `text-white` → `text-<cor>-foreground`.
- `style={}` é proibido até aqui: `progress` virou `<progress>` nativo; o `sonner` passa as vars em classe arbitrária (`[--normal-bg:var(--popover)]`) e lê o tema de `@/contexts/Tema` (não existe `next-themes`).
- `"use client"` sai (não tem RSC).

## Regras

- Só token (`bg-primary`, `text-muted-foreground`…). Cor crua é erro de lint até aqui. Valor arbitrário (`rounded-t-[3rem]`, `has-[>svg]:`) é liberado só nesta pasta.
- Ajuste de marca é por **variante cva** ou pelo token, nunca classe solta na página. Ex.: `Button` tem `success`; `Badge` tem `success warning danger delay`.
- `react-refresh/only-export-components` está desligado aqui (shadcn exporta `buttonVariants` junto do componente).
- `ui/` não importa páginas. Pode importar `@/contexts/*` e `react-router-dom`.
- Arquivo em kebab-case (`selo-de-status.tsx`), export nomeado.

## Compostos do domínio

`casca-de-pagina` (layout logado + dock; a lista de rotas do dock mora ali, cada item com os `papeis` que o veem — filtrado pelo `useAutenticacao`), `layout-de-autenticacao`, `cabecalho-de-tela`, `selo-de-status` (mapa status do banco → rótulo/variante; tipo `Status`; ver abaixo), `grafico-de-barras`, `lista-de-viagens`, `cartao-de-metrica`, `cartao-de-linha` (escreve "Rota", vocabulário L1), `cartao-de-usuario`, `alternador-de-tema`, `campo-de-senha`, `erro-de-carregamento` (`ErroDeCarregamento` pro estado de erro de query + `mensagemDeErro(error)` pro texto de toast; importa `ApiError` de `@/lib/api`). `TooltipProvider` e `Toaster` são montados uma vez no `principal.tsx`; não monte de novo.

### `selo-de-status`

- Um mapa só (`STATUS`) para todos os domínios, chaveado pelo valor cru do banco. Chave repetida entre domínios é a **mesma entrada**: `manutencao` vale para rota e para trem, com um rótulo e uma cor só. Status novo = uma linha no mapa; se o valor já existe em outro domínio, o rótulo/cor dele é herdado.
- Exporta `rotuloDeStatus(status)`, `opcoesDeStatus(lista)` (`{ valor, rotulo }[]` pronto pra `SelectItem`) e `STATUS_DE_VIAGEM`, a tupla de viagem **na ordem em que o filtro exibe** (`as const satisfies readonly ViagemStatus[]`). A tela estreita o `string` do `Select` com `STATUS_DE_VIAGEM.find((item) => item === valor)` em vez de cast.

### `grafico-de-barras`

- A barra é um `<progress>` nativo, não uma `div` com largura: largura proporcional exigiria `style={{ width }}`, que o lint proíbe. `value` = valor, `max` = maior valor da série (1 se todos forem 0, pra não dividir por zero).
- Como o `<progress>` é nativo, a cor vem por pseudo-elementos do navegador, um par por variante (`[&::-webkit-progress-value]` e `[&::-moz-progress-bar]`), mais `appearance-none` e `[&::-webkit-progress-bar]:bg-transparent` na base. Variante nova de cor = acrescentar os **dois** seletores no `cva`. É por isso que o arquivo usa valor arbitrário (liberado nesta pasta).
- `key={rotulo}`: os rótulos de uma série precisam ser únicos. Série vazia mostra "Sem dados para o gráfico.". Acessibilidade: cada `<progress>` leva `aria-label` com rótulo e valor formatado.

### `lista-de-viagens`

- Uma apresentação só para a viagem (cartões abaixo de `md`, tabela de `md` pra cima), reusada por Rotas e `/viagens`. A prop `acoes?: (viagem) => ReactNode` é o único ponto de variação: com ela aparecem o conteúdo no cartão e a coluna "Ações" na tabela; sem ela a lista é só leitura. Não duplique a lista na página.

### Impressão

`casca-de-pagina` marca a barra de identificação e o dock com `nao-imprime`. Regras do bloco `@media print` (por que fica fora de `@layer`, quais tokens troca): `frontend/CLAUDE.md`, seção _Impressão_.

Tudo novo aparece na vitrine `src/pages/Vitrine.tsx` (rota `/ui`) — adicione lá quando criar componente ou variante.
