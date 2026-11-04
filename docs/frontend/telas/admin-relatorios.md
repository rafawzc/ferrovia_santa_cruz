# Telas admin — Relatórios (gerar e visualizar)

Só `gestao` (grupo `GESTAO` em `Aplicacao.tsx`; o item "Relatórios" só aparece no menu dela). Contrato: [`../../backend/api.md`](../../backend/api.md#relatórios-só-gestao).

O formulário é um fluxo de **duas telas ligadas por endereço**: quem gera navega para a visualização com os filtros na URL, então o relatório pode ser recarregado, favoritado e compartilhado (decisão E10 em [`../../decisoes/fechamento-sa.md`](../../decisoes/fechamento-sa.md)).

## `/admin/relatorios` — gerar (`Relatorios.tsx`)

- Campos: tipo (desempenho, consumo de energia, eficiência operacional, manutenção; rótulos em `lib/rotulos.ts`), data inicial, data final e trem (opcional; "Todos os trens" por padrão, lista de `GET /api/trens`).
- Validação (zod): tipo escolhido, as duas datas preenchidas e fim não anterior ao início ("Fim antes do início"). A API não confere o período; é esta tela que impede.
- "Gerar relatório" **não chama a API**: navega para `/admin/relatorios/ver?tipo=&inicio=&fim=&trem_id=` (`trem_id` só quando um trem foi escolhido).

## `/admin/relatorios/ver` — visualizar (`RelatorioVisualizacao.tsx`)

- **Lê os filtros da URL** e valida de novo (tipo conhecido, datas `AAAA-MM-DD`, fim >= início, `trem_id` numérico). URL inválida ou aberta sem parâmetros: não consulta nada, mostra "Escolha o tipo e o período para gerar o relatório." e o botão "Novo relatório". Válida: `useRelatorio` → `GET /api/relatorios`.
- **Resumo** (tipo, início, fim e, se filtrado, o trem pelo prefixo), **tabela** com as `colunas`/`linhas` que a API manda, e **gráfico** (`GraficoDeBarras`) com `grafico.itens`. A tela não conhece os tipos: toda coluna e todo gráfico vêm do contrato. Sem linhas: "Nenhum dado no período." e o gráfico segue com a mensagem de vazio.
- **Células:** `null` vira "—"; número vai por `formatarNumero` (pt-BR, até 2 casas); texto no formato `AAAA-MM-DD` vira `DD/MM/AAAA` (`dataBrasileira`), é o caso de "Última inspeção".
- **Mobile:** abaixo de `md` a tabela dá lugar a um cartão por linha (rótulo e valor).
- **Exportar CSV:** `<a download href="/api/relatorios/csv?...">`; o navegador baixa direto, com o cookie de sessão. **Imprimir:** `window.print()`. O botão "Novo relatório" volta ao formulário.

## Impressão

A folha impressa deve mostrar só o relatório, em preto sobre branco:

- `.nao-imprime` (classe definida em `src/index.css`) esconde o que não é relatório: o alternador de tema, a barra "Conectado como…", o dock e a faixa de botões. Quem cria tela nova com chrome próprio só precisa dessa classe.
- O bloco `@media print` do `index.css` também troca as cores dos tokens por preto e branco, **inclusive no tema escuro**; sem isso o papel saía com texto claro sobre fundo branco. Consequência: no papel, os selos e as barras de status perdem a cor (sucesso e perigo saem pretos, atenção sai cinza); a leitura é pelo texto e pelo comprimento da barra.
- A tela usa as variantes `print:block` e `print:hidden` do Tailwind em vez de depender de `md`: a folha A4 é mais estreita que o breakpoint `md`, então sem elas o papel imprimiria a versão em cartões. A tabela leva `hidden md:block print:block` e os cartões `md:hidden print:hidden`.
- Por que o bloco fica fora de `@layer` e o que mais saber ao mexer nele: [`../../../frontend/CLAUDE.md`](../../../frontend/CLAUDE.md) (seção *Impressão*).
