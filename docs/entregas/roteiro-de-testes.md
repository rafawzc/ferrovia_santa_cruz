# Roteiro de testes — Ferrovia Santa Cruz

**SESI / SENAI — Joinville Moinho** · Curso Técnico em Desenvolvimento de Sistemas
**SA — Projeto de Mapeamento de Ferrovias** · Aplicação **Ferrovia Santa Cruz**

**Integrantes:** Guilherme Wohl · Helena Kemczinski · Rafael Fodi · Yasmin Cota

> Roteiro de teste **manual**, de caixa preta: é o que se verifica clicando no sistema, na ordem em que um avaliador verificaria. O resultado esperado foi escrito **antes** da execução — é isso que faz do roteiro um teste e não uma conferência.
>
> Os testes automatizados do backend são outra coisa e rodam por `python3 fsc.py test` (pytest, banco trocado por fake). Eles cobrem contrato de API, papéis e validação; não cobrem SQL nem tela. Este roteiro cobre o que eles não alcançam.
>
> **Como executar:** em dupla, um opera e o outro anota; quem anota não dá dica. Suba o sistema com `python3 fsc.py up` e abra `http://localhost:5173`. **Nenhum caso deste roteiro apaga, altera ou recria o banco por comando**: tudo o que muda dado muda pela própria tela do sistema, e os casos que criam registros dizem como desfazê-los.
>
> **Falha encontrada não se apaga da tabela** — registra-se na observação que falhou e foi corrigida. Os defeitos já encontrados e corrigidos estão na seção 10, com o que falhou, como se reproduzia e o que ficou. Uma tabela toda verde na primeira passada é sinal de que o roteiro não foi executado de verdade.

## Ambiente da execução

| Item | Valor |
|------|-------|
| Data da execução | *a preencher* |
| Executado por | *a preencher* |
| Navegador | *a preencher* |
| Largura testada | 390px (mobile) e 1440px (desktop) |
| Banco | o de desenvolvimento, com a carga original do `db/script.sql` |

### Usuários usados (senha de todos: `ferrovia123`)

| Usuário | E-mail | Perfil na interface | Cargo mostrado na sessão |
|---------|--------|---------------------|------------------------|
| Ana Gestora | `ana.admin@ferrovia.com` | Administrador | Administrador |
| Bruna Lima | `bruna.rh@ferrovia.com` | Administrador | RH |
| Carlos Souza | `carlos.maq@ferrovia.com` | Maquinista (opera o trem `TR-204`) | Maquinista |
| Cliente Comum | `cliente@email.com` | Usuário comum | Usuário comum |

Dados de exemplo usados nos casos: trens `TR-204`, `TR-118`, `TR-301`, `TR-455`; rotas `1778`, `2645`, `5463`; sensor `S-VEL-001`.

## 1. Instalação e ambiente

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 1 | Subir o projeto em pasta limpa seguindo só o README (`python3 fsc.py up`) | Os três containers sobem saudáveis e `http://localhost:5173` abre | | |
| 2 | Conferir portas publicadas (`python3 fsc.py ps`) | Só o `frontend` publica porta; `backend` e `db` não | | |
| 3 | Abrir o shell do banco (`python3 fsc.py db`) e rodar `SHOW TABLES;` (só consulta) | Lista as dez tabelas do modelo | | |
| 4 | No mesmo shell, `SELECT email, senha_hash FROM usuario;` | A senha vem embaralhada (`$argon2id$...`), ilegível | | |

## 2. Autenticação, sessão e acesso

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 5 | Abrir o sistema sem estar logado | Mostra a tela de login | | |
| 6 | Entrar com senha errada | Mensagem "E-mail ou senha incorretos", sem entrar e sem revelar qual dos dois errou | | |
| 7 | Entrar com `ana.admin@ferrovia.com` / `ferrovia123` | Entra e vai para o painel (`/admin`, título "Dashboard") | | |
| 8 | Recarregar uma tela interna já logado | Continua dentro do sistema | | |
| 9 | Abrir `/admin/trens` em janela anônima | Redireciona para o login | | |
| 10 | Conferir a identificação da sessão depois de entrar, no desktop e no celular | No desktop, o pé da barra lateral mostra nome e cargo (Ana: "Administrador"; Bruna: "RH"), o alternador de tema e "Sair da conta"; no celular, os mesmos dados aparecem no topo e no pé do **Menu**. Não existe barra "Conectado como" no alto da tela | | |
| 11 | Clicar em "Sair da conta" (pé da barra lateral, pé do Menu no celular, ou cartão do Perfil) e apertar o botão voltar do navegador, depois recarregar com Ctrl+F5 | Volta para o login; não recupera o acesso | | |
| 12 | Cadastro público: em `/cadastro`, criar conta nova | Vai para o login com o aviso "Conta criada. Entre com seu e-mail e senha."; ao entrar com ela, o cargo mostrado na sessão é "Usuário comum" e a tela inicial é Viagens | | |
| 13 | Cadastro com e-mail já usado (`cliente@email.com`) | O campo e-mail mostra "Este e-mail já está cadastrado" | | |
| 14 | Em `/recuperar-senha`, informar qualquer e-mail | Mostra sempre a mesma mensagem ("Se o e-mail estiver cadastrado, as instruções serão enviadas."), exista o e-mail ou não | | |

## 3. O que cada perfil NÃO consegue acessar

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 15 | Entrar como `carlos.maq@ferrovia.com` e conferir a navegação (barra lateral no desktop; botão **Menu** no celular) | Mostra Início e os grupos Operação (Rotas, Alertas, Carga), Frota (Trens, Sensores) e Conta (Perfil); **não** mostra o grupo Gestão (Relatórios e Usuários). Na faixa de baixo do celular ficam Início, Rotas, Alertas e Perfil, mais o Menu | | |
| 16 | Como Carlos, digitar `/admin/usuarios` e depois `/admin/relatorios` no endereço | Cada uma devolve para `/admin` (início do maquinista); a tela não abre | | |
| 17 | Como Carlos, abrir Trens, Sensores e Rotas | A lista aparece; em Trens e Sensores uma linha sob o título avisa que cadastro, edição e exclusão são da gestão. Em nenhuma das três há botão de cadastrar nem a coluna "Ações" com editar/excluir (só leitura) | | |
| 18 | Entrar como `cliente@email.com` e conferir a navegação | Mostra só Viagens e o grupo Conta (Perfil); na faixa de baixo do celular, só Viagens e Perfil, mais o Menu | | |
| 19 | Como cliente, digitar `/admin`, `/admin/trens`, `/admin/usuarios` e `/admin/relatorios` | Cada uma devolve para `/viagens`; nenhuma tela de gestão abre | | |
| 20 | Entrar como Ana e conferir a navegação | Mostra Início e os grupos Operação (Rotas, Alertas, Carga), Frota (Trens, Sensores), Gestão (Relatórios, Usuários) e Conta (Perfil); **não** mostra Viagens | | |
| 21 | Como Ana, digitar `/viagens` | A tela de viagens do cliente também abre (é leitura, sem restrição de perfil) | | |
| 22 | Com qualquer perfil, abrir `/perfil` | Abre o perfil da própria pessoa | | |

## 4. Cadastros: trens, sensores, rotas, viagens e carga

Executar como Ana (Administrador), salvo indicação.

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 23 | Em Trens, clicar em "Cadastrar trem" e salvar um trem com dados válidos (ex.: prefixo `TR-900`) | Aviso "Trem cadastrado" e o trem aparece na lista | | |
| 24 | Cadastrar um trem com o prefixo de um que já existe (`TR-204`) | O campo prefixo mostra "Já existe um trem com esse prefixo."; nada é gravado | | |
| 25 | Cadastrar um trem com campo obrigatório vazio e com ano fora de 1900–2100 | Mensagem por campo; nada é gravado | | |
| 26 | Editar `TR-900` pelo botão do lápis na linha (mudar o modelo, "Salvar alterações") e recarregar a página | Aviso "Trem atualizado" e a alteração persiste | | |
| 27 | Editar um trem que tem última inspeção e apagar o campo "Última inspeção", ou tem rota e escolher "Sem rota" | A tela recusa: "Não é possível remover a última inspeção; informe outra data." / "Não é possível remover a rota do trem; selecione outra rota."; nada é gravado | | |
| 28 | Buscar "204" no campo de busca e depois filtrar por status | A lista reduz e mostra só trens que casam com a busca e o status | | |
| 29 | Excluir `TR-900` | Pede confirmação ("Excluir o trem TR-900?") e só remove depois de confirmar; "Cancelar" não remove | | |
| 30 | Excluir `TR-204`, que tem sensores | Aviso "Este trem tem sensores vinculados. Exclua ou transfira os sensores antes."; nada é apagado | | |
| 31 | Em Sensores, clicar em "Cadastrar sensor" | O formulário abre numa janela sobre a lista e o trem é escolhido numa lista ("Selecione o trem"), não digitado | | |
| 32 | Conferir a listagem de sensores | A coluna Trem mostra o prefixo (ex.: `TR-204`), não um número; a coluna **Estado** traz o selo da última leitura (Normal, Atenção ou Crítico) ou "Sem leitura", e a coluna **Última leitura** traz o valor com unidade e a hora, ou "—" se não houver | | |
| 33 | Filtrar sensores por tipo | A lista reduz e mostra só o tipo escolhido | | |
| 34 | Excluir `S-VEL-001`, que já tem leituras | Aviso "Este sensor já tem leituras registradas e não pode ser excluído."; nada é apagado | | |
| 35 | Editar um sensor que tem segmento e apagar o campo Segmento | A tela recusa: "Não é possível remover o segmento; informe outro valor." | | |
| 36 | Em Rotas, aba Rotas: "Cadastrar rota" (ex.: número `9999`) e depois repetir o número | Primeira vez: "Rota cadastrada". Segunda: o campo número mostra "Já existe uma rota com este número" | | |
| 37 | Excluir a rota `1778`, que tem viagens | Aviso "Esta rota tem viagens programadas e não pode ser excluída."; depois excluir `9999` (sem viagens) funciona após confirmar | | |
| 38 | Aba Viagens: "Programar viagem" com chegada **antes** da partida | O formulário recusa com "A chegada deve ser depois da partida" | | |
| 39 | Programar uma viagem válida e filtrar a lista por status, rota, trem e dia | Grava; cada filtro reduz a lista ao que casa | | |
| 40 | Excluir a viagem programada no caso anterior | Pede confirmação (a descrição sugere marcar como cancelada para manter o histórico) e remove após confirmar | | |
| 41 | Em Carga, "Cadastrar carga" (Tipo de carga, Peso `10,5`, Local de partida, Destino) | Aviso "Carga cadastrada" e a carga aparece na lista com tipo, peso e destino | | |
| 42 | Cadastrar carga informando um número de trem que não existe (ex.: `99999`) | O campo mostra "Trem não encontrado"; nada é gravado | | |

## 5. Monitoramento, painel e alertas

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 43 | Como Ana, abrir o painel | Título "Dashboard"; três indicadores na ordem Viagens em andamento, Sensores críticos e Velocidade média; dois gráficos ("Alertas ativos por severidade" e "Trens por status"); abaixo deles, a seção "Viagens em andamento" com a lista das viagens em curso | | |
| 44 | Conferir os indicadores contra o banco por consulta (`python3 fsc.py db`, só `SELECT`) | Trens por status e viagens em andamento batem com `trem` e `viagem`; a velocidade média é a das leituras de velocidade nas últimas 24 horas | | |
| 45 | Como Carlos (com trem `TR-204`), abrir o painel | Título "Dashboard do seu trem"; os números são só do trem dele | | |
| 46 | Como Ana, em Usuários, cadastrar um usuário com cargo Maquinista (sem trem), entrar com ele e abrir o painel | Velocidade média e Sensores críticos mostram **"Sem dados"** (não "0"), sem selo de status ao lado do rótulo; os gráficos mostram "Sem dados para o gráfico."; a seção "Viagens em andamento" não aparece | | |
| 47 | Rodar `python3 fsc.py sim --rodadas 5` e recarregar o painel e a lista de sensores | Aparecem leituras novas e os indicadores mudam | | |
| 48 | Depois do simulador, abrir Alertas | Leituras acima do limite geraram alertas automáticos (origem "<tipo> (sensor)", ex.: "velocidade (sensor)"). Se nenhuma estourou o limite, repetir a rodada | | |
| 49 | Conferir a severidade dos alertas automáticos | Leitura acima do limite crítico nasce com selo **Crítico** (borda vermelha se não tratado); acima do limite de atenção, **Atenção**. Nunca "Normal" | | |
| 50 | Em Alertas, filtrar por severidade, por tipo e por situação | A lista reduz; a situação começa em "Não tratados" e há "Tratados" e "Todos" | | |
| 51 | Clicar em "Marcar como tratado" num alerta | Ele sai de "Não tratados", aparece com o selo "Tratado" em "Todos" (e perde a borda vermelha, se era crítico) e deixa a contagem do gráfico de alertas ativos no painel | | |
| 52 | Clicar em "Reabrir alerta" num alerta tratado | Ele volta para "Não tratados" | | |
| 53 | Como Carlos (maquinista), criar um alerta pelo botão "Novo alerta" do alto da tela | É permitido: o formulário abre numa janela sobre a lista, "Enviar alerta" grava, a janela fecha e aparece o aviso "Alerta enviado" | | |
| 54 | Como Ana, clicar em "Novo alerta" e preencher Rota, Severidade, Tipo, Motivo e Status | Aparece na central com a origem "Rota <número>" e o selo da severidade escolhida | | |
| 55 | Entrar com os três perfis e comparar o início | Ana: "Dashboard" da frota inteira; Carlos: "Dashboard do seu trem"; cliente: não abre painel, cai em Viagens | | |

## 6. Relatórios

Executar como Ana. Perfis sem acesso estão no caso 16 e 19.

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 56 | Em Relatórios, tentar "Gerar relatório" com o formulário vazio | Mensagens "Escolha o tipo", "Informe a data inicial", "Informe a data final"; não sai da tela | | |
| 57 | Informar data final anterior à inicial | O campo final mostra "Fim antes do início" | | |
| 58 | Gerar um relatório de Desempenho com período que contenha leituras | Título "Relatório de Desempenho" com a linha "De DD/MM/AAAA a DD/MM/AAAA · Todos os trens", a tabela (Trem, velocidade média, máxima) e o gráfico | | |
| 59 | Gerar os outros três tipos (Consumo de energia, Eficiência operacional, Manutenção) | Cada um traz as colunas e o gráfico do seu tipo, uma linha por trem | | |
| 60 | Conferir a formatação dos números e das datas no desempenho e na manutenção | Média de velocidade com vírgula e até 2 casas (ex.: `72,33`, nunca `72.33333333333333`); "Última inspeção" como `DD/MM/AAAA`; célula vazia como "—"; as datas da linha de período no mesmo formato | | |
| 61 | Conferir o gráfico contra a tabela, inclusive o número no rótulo da barra | As barras refletem os mesmos números, na escala certa, com o mesmo formato da tabela | | |
| 62 | Escolher um período que termina hoje | Os registros de hoje entram no resultado | | |
| 63 | Filtrar por um trem na lista "Trem" | A lista mostra "prefixo · modelo" (ex.: `TR-204 · <modelo>`), não um número; a linha de período passa a terminar em "Trem TR-204" e a tabela traz só aquele trem | | |
| 64 | Gerar com um período sem nenhum dado | Mostra o cartão "Nenhum dado no período", com a frase "Não há registros deste tipo no período escolhido."; a tabela e o gráfico não aparecem | | |
| 65 | Clicar em "Exportar CSV" e abrir o arquivo num editor de planilhas | Baixa `relatorio-<tipo>-<início>-<fim>.csv`; abre com acentos corretos (sem "Ã§") e uma coluna por campo | | |
| 66 | Clicar em "Imprimir" (visualização de impressão) em largura de A4, no tema claro | Sai só o relatório: sem a barra lateral, sem o cabeçalho de marca do celular, sem a faixa de navegação de baixo e sem os botões ("Exportar CSV", "Imprimir", "Novo relatório"); a **tabela** aparece (não os cartões) | | |
| 67 | Repetir a impressão com o tema escuro ativo | Papel com texto escuro sobre fundo branco, legível | | |
| 68 | Recarregar o endereço do relatório gerado | Mostra o mesmo relatório (os parâmetros estão no endereço) | | |
| 69 | Abrir `/admin/relatorios/ver` sem parâmetros | Mostra "Escolha o tipo e o período para gerar o relatório." e o botão "Novo relatório" | | |

## 7. Gestão de usuários

Executar como Ana. Cada caso diz como desfazer o que cria.

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 70 | Em Usuários, buscar por parte do nome ou do e-mail e filtrar por nível de acesso e por situação | A lista reduz (cartões no celular, tabela no desktop); sem filtro de situação, inativos aparecem; sem resultado, aparece "Nenhum resultado para esta busca" com o botão "Limpar filtros" | | |
| 71 | Clicar em "Cadastrar usuário" e preencher Nome, Email, Cargo **Eletricista** e Senha de 8+ caracteres | Aviso "Usuário cadastrado"; ele aparece na lista | | |
| 72 | Entrar com o usuário do caso 71 e conferir o cargo na sessão (pé da barra lateral, ou topo do Menu no celular) | Mostra **"Eletricista"** como cargo (não "Maquinista"); a navegação é a da equipe operacional (sem o grupo Gestão) | | |
| 73 | Cadastrar outro usuário com o e-mail de um existente | O campo e-mail mostra "E-mail já cadastrado" | | |
| 74 | Editar o usuário do caso 71 (telefone) com "Salvar alterações" e recarregar | Aviso "Usuário atualizado" e a alteração persiste | | |
| 75 | **Trava 1:** abrir a ficha da própria conta (Ana) — cartão dela no celular, botão do lápis na linha no desktop | No bloco "Acesso ao sistema" não há botão de desativar; aparece "Você não pode desativar a própria conta." | | |
| 76 | Gerar senha temporária para o usuário do caso 71 ("Gerar senha temporária" e confirmar) | A senha aparece uma única vez, com botão "Copiar senha"; fechar a janela descarta a senha; a senha anterior deixa de valer e a nova permite entrar | | |
| 77 | Conferir no banco a senha temporária gerada (`SELECT`, caso 4) | Está embaralhada, nunca em texto | | |
| 78 | Desativar o usuário do caso 71 e tentar entrar com ele | Pede confirmação; depois, o login recusa com "Usuário desativado. Fale com a gestão." | | |
| 79 | Reativar o mesmo usuário ("Reativar usuário") | Aviso "Usuário reativado" e o login volta a funcionar | | |
| 80 | **Trava 2:** desativar Bruna (permitido: Ana segue ativa). Em seguida, abrir Ana e tentar trocar o cargo dela para Maquinista (Ana é agora a única administradora ativa) | O sistema recusa com a mensagem "O sistema precisa de pelo menos um administrador ativo"; o cargo de Ana não muda | | |
| 81 | Reativar Bruna. Com as duas ativas, trocar o cargo de Bruna de RH para Administração (outro cargo de gestão) | Permitido: aviso "Usuário atualizado" e Bruna continua administradora; trocar de volta para RH ao fim | | |
| 82 | **Trava 3:** entrar como Carlos e abrir o Perfil | O perfil só tem Nome, Email, Telefone e Nova senha; **não há campo de cargo**; o cargo só muda por um administrador em Usuários | | |
| 83 | Como administrador, trocar o cargo de um usuário comum de teste para Maquinista e entrar com ele | O menu e o acesso passam a ser os de Maquinista; trocar de volta devolve o acesso anterior | | |

## 8. Perfil e viagens do usuário comum

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 84 | Como `cliente@email.com`, abrir Viagens | Lista as viagens da malha, da mais recente para a mais antiga, com rota, trajeto, trem, partida, chegada e selo de status; não há botões de ação | | |
| 85 | Filtrar as viagens por status e por "Dia da partida" | A lista reduz; sem resultado, aparece o cartão "Nenhuma viagem encontrada" com a frase "Tente outro status ou outro dia." | | |
| 86 | Em Perfil, mudar o nome e clicar em "Salvar alterações" | Aviso "Perfil atualizado"; o novo nome passa a aparecer no cartão do Perfil e na identificação da sessão (pé da barra lateral, ou topo do Menu no celular) | | |
| 87 | Em Perfil, digitar Nova senha | Aparece o campo Senha atual; salvar com a senha atual errada mostra erro no campo Senha atual | | |
| 88 | Em Perfil, clicar em "Sair da conta" (no cartão com o nome e o cargo) | Volta para o login | | |

## 9. Interface e qualidade

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 89 | Abrir cada tela a 390px e a 1440px | Listas viram cartões no celular e tabela no desktop; nada estoura | | |
| 90 | Conferir como o status é mostrado, nos dois temas | Todo status aparece como **selo preenchido com rótulo** — nunca ponto de cor, nunca texto colorido, nunca "Sim/Não". A semântica se mantém (normal esverdeado, atenção amarelado, crítico avermelhado, atraso alaranjado) em tons da família sépia, e a mesma chave tem o mesmo rótulo e a mesma cor em todas as telas | | |
| 91 | Navegar só com o teclado numa tela de formulário | O foco é visível e alcança todos os campos e botões | | |
| 92 | Abrir o console do navegador e percorrer as telas | Sem erro e sem warning do React | | |
| 93 | Parar o container do banco (`docker compose stop db`) e usar o sistema; depois `docker compose start db` | Mensagem de falha de carregamento, sem tela branca e sem erro técnico cru; volta ao normal quando o banco sobe (parar um container não apaga dado) | | |
| 94 | Rodar o gate do projeto (`python3 fsc.py check`) | Lint, typecheck, formatação, testes de backend e build do front passam | | |

## 10. Defeitos encontrados e corrigidos

Estes defeitos apareceram ao exercitar o roteiro e na revisão, e foram corrigidos. Ficam aqui, não são apagados. A coluna "Caso" aponta o caso que hoje os protege.

| # | O que falhou | Como se reproduzia | O que ficou (comportamento correto) | Caso |
|---|--------------|--------------------|-------------------------------------|------|
| D1 | O painel do maquinista **sem trem vinculado** mostrava "Sensores críticos: 0" com indicador de normalidade. Ausência de dado era confundida com "zero ocorrências" | Cadastrar usuário com cargo Maquinista (sem trem), entrar com ele e abrir o painel | Ausência de dado é tratada como "não se aplica": a tela diz **"Sem dados"** (velocidade e sensores) e não mostra selo de status nenhum | 46 |
| D2 | O relatório mostrava a média de velocidade como `72.33333333333333` na tabela e no rótulo da barra, e a data como `2026-01-05` | Gerar relatório de Desempenho ou Manutenção com dados | Números em formato brasileiro, até 2 casas (`72,33`); datas como `05/01/2026` | 60, 61 |
| D3 | O filtro de trem do relatório pedia um número, que era o identificador interno do banco, e `0` passava na validação | Em Relatórios, digitar `0` ou um número qualquer no campo de trem | O campo virou uma lista de trens por prefixo e modelo ("Todos os trens" por padrão) | 63 |
| D4 | Na impressão, a tabela do relatório desaparecia, porque a folha A4 é mais estreita que a largura em que a tabela aparece; no tema escuro, o papel saía com texto claro sobre fundo branco | Imprimir (ou visualizar impressão) um relatório com a janela estreita, e repetir com o tema escuro | A tabela sai na impressão em qualquer largura; o papel sai sempre em preto sobre branco, inclusive no tema escuro. No papel, os selos de status perdem a cor (leitura pelo texto) | 66, 67 |
| D5 | A sessão mostrava "Maquinista" para um eletricista: o sistema traduzia o nível de acesso em vez de mostrar o cargo | Cadastrar usuário com cargo Eletricista e entrar com ele | A identificação da sessão mostra o cargo real ("Eletricista", "RH", "Administrador"…) | 10, 72 |
| D6 | Apagar um campo opcional de trem ou sensor (última inspeção, rota, segmento) mostrava sucesso, mas o valor antigo voltava: a atualização parcial não limpa campo | Editar um trem com última inspeção, esvaziar o campo e salvar; recarregar | A tela recusa na hora, antes de enviar, com a mensagem explicando que não dá para remover e pedindo outro valor. Segue como limitação conhecida do contrato (README, seção 8) | 27, 35 |
| D7 | A trava do último administrador podia ser contornada: bastava trocar o cargo dele por um cargo sem gestão | Com um só administrador ativo, editar a conta e trocar o cargo por Maquinista | Qualquer edição que deixe o sistema sem administrador ativo é recusada (conflito, "O sistema precisa de pelo menos um administrador ativo"), seja desativando ou trocando o cargo | 80, 81 |
| D8 | O alerta gerado automaticamente por uma leitura de sensor nascia **sempre com severidade Normal**, mesmo quando a leitura era crítica. *Correção em andamento por outro integrante no momento desta escrita; o caso 49 só passa depois dela.* | Rodar `python3 fsc.py sim --rodadas 5` até uma leitura passar do limite; abrir Alertas | Esperado: leitura acima do limite crítico gera alerta **Crítico**; acima do limite de atenção, **Atenção** | 48, 49 |

## Resumo da execução

| Situação | Casos |
|----------|-------|
| Passou na primeira tentativa | *a preencher* |
| Falhou e foi corrigido | *a preencher* (ver seção 10: D1 a D8) |
| Falhou e virou limitação conhecida | *a preencher* (D6 permanece como limitação do contrato) |
| Total | 94 |

Observação sobre o que mudou neste roteiro: três casos antigos foram retirados por alterarem o banco (importar o script num banco vazio e uma segunda vez, e apagar as leituras para ver o painel sem dados). O terceiro foi substituído pelo caso 46, que prova a mesma regra sem tocar no banco. As demais limitações conhecidas estão na seção *Limitações conhecidas* do [`README.md`](../../README.md).
