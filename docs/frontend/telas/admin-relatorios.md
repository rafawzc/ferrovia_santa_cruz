# Telas admin — Relatórios (gerar e visualizar)

Só `gestao` (grupo `GESTAO` em `Aplicacao.tsx`; o item "Relatórios" só aparece na navegação dela). Contrato: [`../../backend/api.md`](../../backend/api.md#relatórios-só-gestao). Composição recomposta em 2026-11-09 sob [`../principios-de-ui.md`](../principios-de-ui.md).

O formulário é um fluxo de **duas telas ligadas por endereço**: quem gera navega para a visualização com os filtros na URL, então o relatório pode ser recarregado, favoritado e compartilhado (decisão E10 em [`../../decisoes/fechamento-sa.md`](../../decisoes/fechamento-sa.md)).

## `/admin/relatorios` — gerar (`Relatorios.tsx`)

- Cabeçalho "Relatórios" com apoio "Desempenho, consumo de energia, eficiência operacional e manutenção da frota." — a linha de apoio é o que lista os tipos, em vez de um parágrafo explicando a tela.
- Formulário num `Card` de `max-w-2xl` (linha de leitura curta): tipo (`Select`), **Período** num `FieldSet` com legenda, data inicial e data final lado a lado no `sm`, e trem (opcional; "Todos os trens" por padrão, lista de `GET /api/trens`). Rótulos em `lib/rotulos.ts`.
- O botão "Gerar relatório" fica à direita no desktop e em largura cheia no celular.
- Enquanto a lista de trens carrega, o campo mostra um `Skeleton` em pílula; se ela falhar, uma `FieldDescription` avisa "A lista de trens não carregou. O relatório sai com a frota inteira." — o formulário continua utilizável.
- Validação (zod): tipo escolhido, as duas datas preenchidas e fim não anterior ao início ("Fim antes do início"). A API não confere o período; é esta tela que impede.
- "Gerar relatório" **não chama a API**: navega para `/admin/relatorios/ver?tipo=&inicio=&fim=&trem_id=` (`trem_id` só quando um trem foi escolhido).

## `/admin/relatorios/ver` — visualizar (`RelatorioVisualizacao.tsx`)

- **Lê os filtros da URL** e valida de novo (tipo conhecido, datas `AAAA-MM-DD`, fim >= início, `trem_id` numérico). URL inválida ou aberta sem parâmetros: não consulta nada e mostra o cartão "Sem período definido" com a frase "Escolha o tipo e o período para gerar o relatório." e o botão "Novo relatório". Válida: `useRelatorio` → `GET /api/relatorios`.
- **A tela virou um documento.** O resumo em `dl` (tipo, início, fim, trem) **saiu**: o título é `Relatório de <tipo>` e a linha de apoio do cabeçalho é `De DD/MM/AAAA a DD/MM/AAAA · Todos os trens` (ou `· Trem <prefixo>`, caindo no id quando a lista de trens não carregou). Isso dá um cabeçalho de documento que já serve de folha impressa, sem bloco extra.
- **As ações moram no cabeçalho** (`actions` do `CabecalhoDeTela`), nesta ordem: "Exportar CSV" (`default`), "Imprimir" (`outline`) e "Novo relatório" (`outline`). As três levam `nao-imprime`. Título e período continuam iguais nos estados de carregando e de erro, mas ali só "Novo relatório" aparece — não se exporta nem se imprime o que não carregou.
- **Conteúdo**: tabela com as `colunas`/`linhas` que a API manda (primeira coluna à esquerda, as demais à direita com `tabular-nums`) e, embaixo, o gráfico (`GraficoDeBarras`) com `grafico.itens` num `Card` com `print:break-inside-avoid`. A tela não conhece os tipos: toda coluna e todo gráfico vêm do contrato. Sem linhas, aparece o cartão "Nenhum dado no período" e nem a tabela nem o gráfico são montados.
- **Células:** `null` vira "—"; número vai por `formatarNumero` (pt-BR, até 2 casas); texto no formato `AAAA-MM-DD` vira `DD/MM/AAAA` (`dataBrasileira`), é o caso de "Última inspeção".
- **Mobile:** abaixo de `md` a tabela dá lugar a um cartão por linha (rótulo à esquerda, valor à direita).
- **Exportar CSV:** `<a download href="/api/relatorios/csv?...">`; o navegador baixa direto, com o cookie de sessão. **Imprimir:** `window.print()`. O botão "Novo relatório" volta ao formulário.

## Impressão

A folha impressa deve mostrar só o relatório, em preto sobre branco:

- `.nao-imprime` (classe definida em `src/index.css`) esconde o que não é relatório: a barra lateral, o cabeçalho de marca do celular e o dock (`casca-de-pagina.tsx`) e os três botões do cabeçalho. Quem cria tela nova com chrome próprio só precisa dessa classe. O alternador de tema não precisa mais de tratamento nas telas logadas — ele vive dentro da casca, que já está marcada.
- O bloco `@media print` do `index.css` troca **todos** os tokens de cor por preto, branco e cinza, **inclusive no tema escuro**; sem isso o papel saía com texto claro sobre fundo branco. Consequência: no papel, os selos e as barras de status perdem a cor (sucesso, perigo e destrutivo saem pretos; atenção e atraso, cinza); a leitura é pelo texto e pelo comprimento da barra — e é por isso que status sempre carrega rótulo.
- A tela usa as variantes `print:block` e `print:hidden` do Tailwind em vez de depender de `md`: a folha A4 é mais estreita que o breakpoint `md`, então sem elas o papel imprimiria a versão em cartões. A tabela leva `hidden md:block print:block` e os cartões `md:hidden print:hidden`. O `Card` da tabela também ganha `print:overflow-visible`, senão o `overflow-hidden` corta linha que atravessa a quebra de página.
- O `main` da casca tem `print:pb-0` (o `pb-28` existe só para o dock não tapar o conteúdo na tela).
- Por que o bloco fica fora de `@layer` e o que mais saber ao mexer nele: [`../../../frontend/CLAUDE.md`](../../../frontend/CLAUDE.md) (seção *Impressão*).
