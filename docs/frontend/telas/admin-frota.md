# Telas admin — Trens e Sensores

`/admin/trens` (`pages/admin/Trens.tsx`) e `/admin/sensores` (`pages/admin/Sensores.tsx`). Quem acessa: `operacional` e `gestao`. **Escrita só `gestao`:** o botão "Cadastrar" e as ações Editar/Excluir só existem para ela (`podeEscrever`); no backend o guard é o mesmo (`403` para `operacional`). Contrato: [`../../backend/api.md`](../../backend/api.md) (seções Trens e Sensores).

Padrão comum das duas: no celular, lista de cards; a partir de `md`, tabela. Cadastro e edição num `Dialog` (react-hook-form + zod); exclusão com `AlertDialog` de confirmação. Os campos numéricos e de data são texto no formulário e viram número só no envio.

## Trens

- **Dados:** `GET /api/trens?busca=&status=`. Filtros na própria tela: busca por prefixo ou modelo e status (ativo, manutenção, parado, via `SeloDeStatus`). Cada trem mostra prefixo, modelo, ano, capacidade (t), status, última inspeção (`dataBrasileira`), rota (`linha_numero`) e quantidade de sensores.
- **Formulário:** prefixo, modelo, ano (1900–2100), capacidade (aceita vírgula, `> 0`), status, última inspeção (opcional), rota (opcional, select de `GET /api/linhas`).
- **Erros:** `409` ao salvar → "Já existe um trem com esse prefixo." no campo prefixo. `409` ao excluir → toast "Este trem tem sensores vinculados. Exclua ou transfira os sensores antes."; o `409` da API vale também para trem com viagem, e a frase da tela cita só sensores.
- **Não dá pra apagar** a última inspeção nem a rota de um trem que já os tem: o `PATCH` trata `null` como "não mexe". A tela segura antes de enviar e mostra "Não é possível remover a última inspeção; informe outra data." / "Não é possível remover a rota do trem; selecione outra rota."

## Sensores

- **Dados:** `GET /api/sensores?tipo=`; o único filtro da tela é o tipo (velocidade, temperatura, falha, energia, localização). Cada sensor mostra código, nome, trem, tipo, localização, segmento e **última leitura**: selo de status (normal, atenção, crítico), valor e hora; "—" quando não há leitura. O valor leva "km/h" só nos sensores de velocidade (a única unidade que o projeto define).
- **Formulário:** código, nome, tipo, localização, segmento (opcional) e trem (select de `GET /api/trens`).
- **Erros:** `409` ao salvar → "Já existe um sensor com esse código." no campo código. `409` ao excluir → toast "Este sensor já tem leituras registradas e não pode ser excluído."
- **Segmento:** não dá pra apagar depois de preenchido (mesma regra do `null` = "não mexe"); a tela avisa "Não é possível remover o segmento; informe outro valor."
- **A última leitura é derivada** no backend, não é coluna ([`../../decisoes/fechamento-sa.md`](../../decisoes/fechamento-sa.md), E7). A tela não cria leitura: elas chegam por `POST /api/leituras` (simulador `python3 fsc.py sim`).
