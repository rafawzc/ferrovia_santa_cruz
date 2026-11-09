# Telas admin — Trens e Sensores

`/admin/trens` (`pages/admin/Trens.tsx`) e `/admin/sensores` (`pages/admin/Sensores.tsx`). Quem acessa: `operacional` e `gestao`. **Escrita só `gestao`:** o botão "Cadastrar" e as ações Editar/Excluir só existem para ela (`podeEscrever`); no backend o guard é o mesmo (`403` para `operacional`). Quem não pode escrever lê, no apoio do cabeçalho, de quem é a escrita ("Cadastro, edição e exclusão da frota são da gestão." / "Cadastro e edição de sensores são da gestão."). Contrato: [`../../backend/api.md`](../../backend/api.md) (seções Trens e Sensores). Composição recomposta em 2026-11-09 sob [`../principios-de-ui.md`](../principios-de-ui.md).

Padrão comum das duas, idêntico de propósito (um sistema só):

- Filtros logo abaixo do cabeçalho, na mesma linha de borda do conteúdo.
- **Cartões abaixo de `md`, tabela a partir de `md`** — a mesma informação nas duas formas, sem coluna escondida. O cartão lidera com o identificador (prefixo / código) e o nome/modelo embaixo, selo à direita, e o resto como `dt`/`dd` alinhado à direita com `tabular-nums`. A tabela mora dentro de um `Card`.
- **Carregando** com esqueletos `role="status" aria-label="Carregando"` na altura do cartão (celular) e da linha (desktop); **erro** com `ErroDeCarregamento` + `refetch`; **vazio** em dois sabores: com filtro ("Nenhum trem nesse filtro" / "Nenhum sensor desse tipo", ação de limpar) e sem filtro ("Nenhum trem cadastrado" / "Nenhum sensor cadastrado", ação "Cadastrar primeiro …" só pra `gestao`).
- Cadastro e edição num `Dialog` (react-hook-form + zod); exclusão com `AlertDialog` cujo botão diz o verbo e o objeto ("Excluir trem", "Excluir sensor"). Os campos numéricos e de data são texto no formulário e viram número só no envio.
- Ações por linha: dois botões de ícone `ghost` com `aria-label` ("Editar trem FSC-001") e `Tooltip`.

## Trens

- **Dados:** `GET /api/trens?busca=&status=`. Filtros na própria tela (grade `md:grid-cols-3`, busca ocupando duas colunas): busca por prefixo ou modelo e status (ativo, manutenção, parado, via `SeloDeStatus`).
- **Colunas/campos exibidos:** Trem (prefixo + modelo), Ano, Capacidade (t), Status, Última inspeção (`dataBrasileira`, "—" quando vazia), Rota (`linha_numero`, "—" quando sem rota) e Sensores (`total_sensores`). Ano, capacidade e sensores alinhados à direita.
- **Formulário:** prefixo, modelo, ano (1900–2100), capacidade (aceita vírgula, `> 0`), status, última inspeção (opcional), rota (opcional, select de `GET /api/linhas` com o placeholder "Sem rota").
- **Erros:** `409` ao salvar → "Já existe um trem com esse prefixo." no campo prefixo. `409` ao excluir → toast "Este trem tem sensores vinculados. Exclua ou transfira os sensores antes."; o `409` da API vale também para trem com viagem, e a frase da tela cita só sensores.
- **Não dá pra apagar** a última inspeção nem a rota de um trem que já os tem: o `PATCH` trata `null` como "não mexe". A tela segura antes de enviar e mostra "Não é possível remover a última inspeção; informe outra data." / "Não é possível remover a rota do trem; selecione outra rota."

## Sensores

- **Dados:** `GET /api/sensores?tipo=`; o único filtro da tela é o tipo (velocidade, temperatura, falha, energia, localização), num `Select` de largura cheia no celular e `md:w-64` no desktop.
- **Colunas/campos exibidos:** Sensor (código + nome), Trem, Tipo, Local, **Estado**, Última leitura e Medida em. O Estado é o selo da última leitura (normal, atenção, crítico) ou o texto "Sem leitura"; o valor leva "km/h" só nos sensores de velocidade (a única unidade que o projeto define) e sai "—" quando não há leitura. Na tabela, Local junta localização e segmento (`localizacao · segmento`); no cartão, os dois são linhas separadas.
- **Formulário:** código, nome, tipo, localização, segmento (opcional) e trem (select de `GET /api/trens`).
- **Erros:** `409` ao salvar → "Já existe um sensor com esse código." no campo código. `409` ao excluir → toast "Este sensor já tem leituras registradas e não pode ser excluído." (o texto do `AlertDialog` já avisa disso antes).
- **Segmento:** não dá pra apagar depois de preenchido (mesma regra do `null` = "não mexe"); a tela avisa "Não é possível remover o segmento; informe outro valor."
- **A última leitura é derivada** no backend, não é coluna ([`../../decisoes/fechamento-sa.md`](../../decisoes/fechamento-sa.md), E7). A tela não cria leitura: elas chegam por `POST /api/leituras` (simulador `python3 fsc.py sim`).
