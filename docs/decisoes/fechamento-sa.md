# Decisões do fechamento da SA

> Registro das decisões tomadas para fechar a Situação de Aprendizagem — cobertura das onze telas obrigatórias, blocos 2 e 4 do Guia, e os entregáveis do Fechamento. Mesmo formato de [`stack.md`](stack.md): contexto, decisão, consequência. Quando uma decisão mudar, **não apague** — marque a antiga como superada e acrescente a nova embaixo.
>
> Estas decisões **superam em parte** [`uniformizacao-telas.md`](uniformizacao-telas.md), que estava em BRAINSTORMING com as questões O1–O4 abertas. Onde há conflito, vale o que está aqui, e o item correspondente está marcado abaixo.

---

## E1 — Viagem é tabela própria, não um campo em `linha`

**Data:** 2026-11-03 · **Status:** vigente · **Resolve:** O3 de `uniformizacao-telas.md`

**Contexto:** o Guia pede que a tela de rotas mostre trem, trajeto, horários e status, que o painel conte "viagens em andamento", e que o relatório de eficiência operacional agrupe viagens concluídas, canceladas e atrasadas **por trem**. A tabela `linha` tem um status só, e o trem se liga a ela por `trem.linha_id`.

**Decisão:** `linha` continua sendo a rota da malha (número, `origem`, `destino`, status operacional) e entra a tabela **`viagem`** (`linha_id`, `trem_id`, `partida_prevista`, `chegada_prevista`, `status`).

**Porquê:** sem histórico de viagens, "viagens concluídas por trem" não existe — uma linha tem um estado atual, não um passado. Enfiar horários e status de viagem em `linha` entregaria o painel e quebraria o relatório, além de misturar dois conceitos nos cartões que o cliente vê.

**Consequência:** uma tabela e um CRUD a mais. Em troca, quatro exigências do Guia passam a ser uma consulta simples: viagens em andamento é `COUNT` com `status = 'em_andamento'`, e a eficiência operacional é um `GROUP BY trem, status`.

---

## E2 — Gráfico em CSS, sem biblioteca

**Data:** 2026-11-03 · **Status:** vigente

**Contexto:** o Guia pede gráfico no painel e nos relatórios, e aceita duas soluções: barras calculadas em CSS ou uma biblioteca por CDN. As duas sustentam o nível Adequado; a biblioteca só vale mais se a equipe souber explicar o que ela faz.

**Decisão:** barras com largura proporcional ao maior valor, usando os tokens de cor semântica que já existem em `src/index.css`.

**Porquê:** zero dependência nova, funciona offline (importa na apresentação), não briga com a regra de lint que proíbe cor crua, e o cálculo é uma regra de três que qualquer integrante explica na arguição. Uma biblioteca seria código que ninguém da equipe escreveu e teria de defender.

**Consequência:** o gráfico é mais simples visualmente. Em compensação, o critério "o gráfico reflete os mesmos dados da tabela, com escala correta" é trivialmente verificável — a largura sai do mesmo array que preenche a tabela.

---

## E3 — Redefinição de senha pelo administrador

**Data:** 2026-11-03 · **Status:** vigente

**Contexto:** `recupera_senha` é uma das onze telas obrigatórias, mas enviar e-mail de verdade exige servidor de correio, que está fora do escopo. O Guia aceita duas saídas: código exibido na tela simulando o envio, ou redefinição feita pelo administrador.

**Decisão:** a redefinição é feita pelo **administrador**, na tela de gestão de usuários, gerando uma senha temporária aleatória que aparece **uma única vez** na tela de quem a gerou. A tela pública `/recuperar-senha` continua existindo e responde sempre a mesma mensagem, sem revelar se o e-mail existe.

**Consequência:** o usuário comum depende de um administrador para voltar a entrar — limitação registrada no README. A senha temporária é gravada com o mesmo `password_hash` do cadastro: em nenhum momento existe senha em texto no banco. Em produção isso seria um código com validade, enviado por e-mail.

---

## E4 — `alerta` estendido em vez de uma tabela `notificacoes`

**Data:** 2026-11-03 · **Status:** vigente · **Supera:** L2 de `uniformizacao-telas.md` · **Resolve:** O1

**Contexto:** L2 decidiu manter `alerta` e **acrescentar** uma tabela `notificacoes` dirigida ao usuário, com a tela agregando as duas. A forma exata ficou aberta (O1) e nunca foi implementada.

**Decisão:** não criar `notificacoes`. `alerta` ganha `tipo`, `severidade` (`normal`/`atencao`/`critico`) e `tratado`.

**Porquê:** com esses três campos, `alerta` atende a tela inteira que o Guia descreve — filtro por severidade, filtro por tipo, destaque do crítico — e também o indicador "alertas ativos por severidade" do painel. Uma tabela de notificações por usuário não tem consumidor nesta entrega: nenhuma tela do Guia mostra "lida/não lida".

**Consequência:** menos uma tabela e menos um CRUD. Se um dia existir notificação dirigida ao usuário, ela nasce como tabela nova sem desfazer nada do que está feito.

---

## E5 — "Alerta ativo" é o alerta não tratado

**Data:** 2026-11-03 · **Status:** vigente

**Contexto:** decisão deixada em aberto pelo Guia do bloco 4: o painel conta "alertas ativos por severidade", e cabe à equipe definir o que é ativo — todos, os das últimas horas, ou os não tratados.

**Decisão:** ativo é `tratado = FALSE`.

**Porquê:** é o único critério que depende de uma ação humana registrada, e não da passagem do tempo. "Das últimas horas" faria um alerta crítico desaparecer do painel sozinho, sem ninguém ter olhado para ele.

**Consequência:** o painel só esvazia quando alguém marca os alertas como tratados, o que é o comportamento desejado numa central de monitoramento. Exige a ação de tratar na tela de alertas — que foi implementada.

---

## E6 — Unicidade do prefixo do trem mora no banco

**Data:** 2026-11-03 · **Status:** vigente

**Contexto:** decisão de modelagem deixada em aberto pelo Guia do bloco 2: impedir prefixo repetido com restrição de unicidade no banco, ou apenas verificar na aplicação antes de gravar.

**Decisão:** `UNIQUE` em `trem.prefixo` (e em `sensor.codigo`). A aplicação não repete a verificação: o erro de integridade sobe e o handler global traduz o `1062` em 409 com mensagem em português.

**Porquê:** uma trava em código vale para os caminhos que existiam quando ela foi escrita; a do banco vale para todos, inclusive os que ainda não foram escritos e para um `INSERT` manual. O custo é a mensagem vir do tradutor de erro e não de uma validação dedicada — e esse tradutor já existia.

**Consequência:** duas inserções simultâneas com o mesmo prefixo não dependem de ordem de verificação para dar erro. Em troca, a mensagem é genérica ("Registro duplicado"); se precisar ser específica por campo, é o handler que muda, num lugar só.

---

## E7 — `ultima_leitura` é derivada, não armazenada

**Data:** 2026-11-03 · **Status:** vigente · **Resolve:** O2 de `uniformizacao-telas.md`

**Contexto:** o Guia do bloco 2 descreve `ultima_leitura` como coluna de `sensores`, preenchida à mão, e diz que no bloco 3 ela "passa a ser calculada a partir das leituras reais". O bloco 3 foi implementado.

**Decisão:** não existe coluna. O indicador vem da leitura mais recente daquele sensor, por consulta. `sensor.segmento` **é** coluna (a outra metade de O2).

**Porquê:** coluna denormalizada precisaria ser reescrita a cada leitura nova, e qualquer caminho que esquecesse de atualizá-la mostraria um indicador velho na tela — o tipo de bug que não aparece em teste e aparece na apresentação.

**Consequência:** a listagem de sensores custa uma junção a mais. É irrelevante neste volume, e o índice `(sensor_id, data_hora)` cobre a consulta.

---

## E8 — Limites de sensor são constantes no serviço

**Data:** 2026-11-03 · **Status:** vigente

**Contexto:** a geração automática de alerta a partir de leitura fora do limite precisa saber qual é o limite de cada tipo de sensor. Decisão em aberto do bloco 3: onde os limites moram.

**Decisão:** um mapa de constantes por `tipo_dado` em `services/leituras.py`, com limite de atenção e limite crítico. Não é tabela nem variável de ambiente.

**Porquê:** são quatro pares de números que mudam quando a engenharia muda de opinião, não quando o usuário usa o sistema. Tabela exigiria CRUD, tela e seed para um dado que ninguém edita; variável de ambiente esconderia a regra do código que a aplica.

**Consequência:** mudar um limite é mudar uma linha e reiniciar o backend. Se algum dia o limite passar a ser por sensor (e não por tipo), aí sim vira coluna em `sensor` — e o serviço já é o único lugar que lê o valor.

---

## E9 — Script único de banco, destrutivo e idempotente

**Data:** 2026-11-03 · **Status:** vigente

**Contexto:** o Fechamento exige "um arquivo só, que cria tudo do zero com dados de exemplo", e o nível Avançado exige poder reimportar quantas vezes for necessário. O projeto tinha `schema.sql` + `seed.sql` com `CREATE TABLE IF NOT EXISTS`.

**Decisão:** um `db/script.sql` com `DROP TABLE IF EXISTS` em ordem reversa de FK, `CREATE` em ordem de dependência e os `INSERT` de carga. Sem `CREATE DATABASE`/`USE`, porque o entrypoint do container já entrega o banco criado e selecionado.

**Consequência:** reimportar é sempre seguro e sempre deixa o mesmo estado. O preço é que importar **apaga** o que estiver lá — é um script de criação, não de migração. Quem importa à mão precisa selecionar o banco antes. Detalhe operacional em [`../../db/CLAUDE.md`](../../db/CLAUDE.md).

---

## E10 — A tabela `relatorio` não é usada pela geração

**Data:** 2026-11-03 · **Status:** vigente

**Contexto:** a entrega de banco criou a tabela `relatorio` (autor, tipo, período, tipo de falha). O Guia manda o formulário de relatório usar `GET`, para o relatório ser recarregável e compartilhável por endereço.

**Decisão:** a geração de relatório é **sem estado**: lê os parâmetros do endereço, consulta e devolve. A tabela `relatorio` permanece com o histórico de pedidos que veio do seed, e nenhum endpoint escreve nela.

**Porquê:** registrar o pedido exigiria um `POST` no meio de uma consulta, contrariando a razão pela qual o Guia pede `GET` ali. Apagar a tabela desfaria uma entrega já avaliada.

**Consequência:** é uma tabela parada, e isso está declarado nas limitações do README em vez de ficar para o avaliador descobrir. Se o histórico de emissões passar a ser requisito, o lugar dele já existe.
