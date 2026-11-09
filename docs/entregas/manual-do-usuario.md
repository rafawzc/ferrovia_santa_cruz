# Manual do usuário — Ferrovia Santa Cruz

## Apresentação

A **Ferrovia Santa Cruz** é um sistema para acompanhar a ferrovia pelo navegador, no computador ou no celular. Ele reúne em um só lugar os trens, os sensores instalados neles, as rotas, as viagens, as cargas e os alertas.

Os sensores enviam leituras (velocidade, temperatura, consumo de energia e outras). Quando uma leitura passa do limite, o sistema cria um alerta. O painel inicial resume a situação, e quem administra o sistema pode gerar relatórios por período e levá-los para uma planilha ou para o papel.

O que cada pessoa vê depende do seu perfil: **Usuário comum**, **Maquinista** ou **Administrador**. A seção "Os perfis" explica a diferença.

## Como acessar

1. Abra o endereço do sistema no navegador. Se você não estiver conectado, aparece a tela de entrada.
2. Digite o seu **e-mail** e a sua **senha** e entre. Cada pessoa vai para a sua tela inicial: o Usuário comum cai em **Viagens**; Maquinista e Administrador caem no painel.
3. **No computador**, a navegação fica numa barra lateral à esquerda, com os itens separados em grupos (Operação, Frota, Gestão e Conta). No pé dela ficam o seu nome, o seu cargo, o botão para trocar entre o tema claro e o escuro e o botão **Sair da conta** — use-o ao terminar, principalmente em computador compartilhado.
4. **No celular**, a navegação é uma faixa arredondada fixa na parte de baixo da tela, com os itens mais usados e o botão **Menu**. O Menu abre a lista completa das seções e, no pé dela, o seu nome, o seu cargo, o tema e o **Sair da conta**. Na faixa de baixo só o item aberto mostra o nome; os outros aparecem apenas como ícone.
5. Nas telas de entrada, de criar conta e de recuperar senha (quando você ainda não entrou), o botão de tema fica no canto superior direito.
6. O **Perfil** também tem o botão **Sair da conta**, no cartão com o seu nome.

**Não tenho conta.** Na tela de entrada, escolha "Criar conta", preencha Nome, Email, Senha (de 8 a 128 caracteres) e Confirmar senha, e ligue o aceite dos termos. A conta nasce sempre como **Usuário comum**. Depois de criada, você volta à tela de entrada para fazer o primeiro acesso. Contas de teste estão no [README](../../README.md).

**Esqueci a minha senha.** A opção "Esqueceu sua senha?" da tela de entrada **não envia e-mail**. Peça a um Administrador que gere uma senha temporária para você (veja "Tarefas principais" do Administrador). Depois de entrar, troque a senha em **Perfil**.

## Os perfis

| Perfil | Para quem é | O que vê na navegação |
|--------|-------------|-----------------------|
| **Usuário comum** | Quem só consulta as viagens | Viagens · **Conta:** Perfil |
| **Maquinista** | Equipe que opera os trens | Início · **Operação:** Rotas, Alertas, Carga · **Frota:** Trens, Sensores · **Conta:** Perfil |
| **Administrador** | Quem gerencia o sistema | Início · **Operação:** Rotas, Alertas, Carga · **Frota:** Trens, Sensores · **Gestão:** Relatórios, Usuários · **Conta:** Perfil |

Na faixa de baixo do celular cabem só os itens mais usados — Início, Rotas, Alertas e Perfil para a equipe; Viagens e Perfil para o Usuário comum. O resto está no **Menu**.

- **Usuário comum** consulta as viagens e edita o próprio perfil. Não abre nenhuma tela de gestão.
- **Maquinista** acompanha o painel (só do trem que opera), trens, sensores, rotas e viagens, e também registra alertas e cargas. Nessas telas ele **só olha**: os botões para cadastrar, editar e excluir não aparecem para ele. Não acessa Usuários nem Relatórios.
- **Administrador** faz tudo o que o Maquinista faz e mais: cadastra, edita e exclui trens, sensores, rotas e viagens, gerencia os usuários e gera relatórios.

O perfil é definido pelo **cargo** da pessoa, e só um Administrador troca o cargo de alguém. Ninguém muda o próprio perfil. O cargo aparece junto do seu nome — no pé da barra lateral, no computador, e no topo do Menu, no celular (por exemplo, "Eletricista" ou "RH"); um Eletricista tem o perfil Maquinista, e um RH tem o perfil Administrador.

Se você digitar o endereço de uma tela que o seu perfil não abre, o sistema volta para a sua tela inicial.

## Tarefas principais

### Para todos

**Trocar o nome, o telefone ou a senha**
1. Abra **Perfil** na navegação.
2. No cartão "Dados da conta", altere Nome, Email ou Telefone. Para trocar a senha, digite a **Nova senha** (mínimo de 8 caracteres); aparece o campo **Senha atual**, que você deve preencher.
3. Clique em **Salvar alterações**. O aviso "Perfil atualizado" confirma.

A foto não pode ser trocada.

### Usuário comum: consultar viagens

1. Abra **Viagens**. A lista mostra as viagens da ferrovia, da mais recente para a mais antiga, com rota, trajeto, trem, partida, chegada e situação.
2. Para reduzir a lista, escolha uma situação (por exemplo, Em andamento) ou um dia.

### Maquinista e Administrador

**Ler o painel**
1. Abra **Início**. O painel mostra três números — Viagens em andamento, Sensores críticos e Velocidade média —, depois dois gráficos ("Alertas ativos por severidade" e "Trens por status") e, por último, a lista das viagens em andamento.
2. O Maquinista vê só o trem que opera ("Dashboard do seu trem"); o Administrador vê a ferrovia inteira.
3. "Sem dados" significa que não há informação para mostrar. Não é o mesmo que zero.

**Consultar trens, sensores e rotas**
1. Abra **Trens**, **Sensores** ou **Rotas**.
2. Em Trens, use a busca por prefixo ou modelo e o filtro de situação. Em Sensores, filtre por tipo; a coluna **Estado** mostra se o sensor está Normal, em Atenção ou Crítico, e a coluna **Última leitura** mostra o valor e a hora da leitura. Em Rotas, a aba **Rotas** lista as rotas e a aba **Viagens** lista as viagens, com filtros de situação, rota, trem e dia.

**Registrar um alerta**
1. Abra **Alertas** e clique em **Novo alerta**, no alto da tela. Abre uma janela sobre a lista.
2. Escolha a Rota e a Severidade e preencha Tipo, Motivo e Status. O Tempo de espera é opcional.
3. Clique em **Enviar alerta**. A janela fecha e o aviso "Alerta enviado" confirma.

**Tratar um alerta**
1. Em **Alertas**, a central lista por padrão os alertas **Não tratados**. Filtre por severidade, tipo ou situação se precisar.
2. No alerta resolvido, clique em **Marcar como tratado**. Ele sai da lista de pendentes, passa a exibir o selo "Tratado" e deixa de contar no painel. Para voltar atrás, mude a situação para "Tratados" ou "Todos" e clique em **Reabrir alerta**.
3. Alertas críticos ainda não tratados aparecem com borda vermelha.

**Cadastrar uma carga**
1. Abra **Carga** e clique em **Cadastrar carga**, no alto da tela.
2. Informe Tipo de carga, Peso (t), Local de partida e Destino. Vagão e Nº do trem são opcionais; deixe em branco o que não souber.
3. Clique em **Cadastrar carga**. O aviso "Carga cadastrada" aparece e a carga entra na lista.

### Somente o Administrador

**Cadastrar, editar ou excluir trens, sensores, rotas e viagens**
1. Abra **Trens**, **Sensores** ou **Rotas**. O botão de criar diz o que cria: **Cadastrar trem**, **Cadastrar sensor**, **Cadastrar rota** (aba Rotas) ou **Programar viagem** (aba Viagens).
2. Preencha o formulário, que abre numa janela sobre a lista, e confirme. Para alterar, use o botão **Editar** do item (o lápis, na linha da tabela) e **Salvar alterações**; para remover, use **Excluir** (a lixeira) e confirme na pergunta que aparece.
3. Alguns itens não podem ser excluídos: trem com sensores vinculados, sensor que já tem leituras e rota com viagens. O sistema avisa e não apaga nada.
4. Uma informação opcional já preenchida (última inspeção ou rota do trem, segmento do sensor) pode ser trocada por outra, mas não apagada. O sistema avisa no próprio formulário.

**Gerar um relatório**
1. Abra **Relatórios**.
2. Escolha o **Tipo de relatório** (Desempenho, Consumo de energia, Eficiência operacional ou Manutenção), a **Data inicial** e a **Data final**. Se quiser, escolha um **Trem**; o padrão é "Todos os trens".
3. Clique em **Gerar relatório**. A tela de resultado traz o título ("Relatório de Desempenho", por exemplo), a linha com o período e o trem escolhidos, a tabela e o gráfico.
4. Para **levar para uma planilha**, clique em **Exportar CSV**: o arquivo é baixado e abre com os acentos corretos.
5. Para **imprimir**, clique em **Imprimir**. A folha sai só com o relatório, sem a navegação e sem os botões, em preto sobre branco. As cores de situação não saem no papel; leia pelo texto.
6. Para fazer outro, clique em **Novo relatório**.

**Cadastrar um usuário**
1. Abra **Usuários** e clique em **Cadastrar usuário**, no alto da tela.
2. Informe Nome, Email, Telefone (opcional), **Cargo** e Senha de pelo menos 8 caracteres. O cargo define o perfil da pessoa.
3. Clique em **Cadastrar usuário**. O aviso "Usuário cadastrado" aparece. Use a busca e os filtros de nível de acesso e situação para achar alguém depois.

**Editar, desativar ou reativar um usuário**
1. Em **Usuários**, abra a ficha da pessoa: no celular, toque no cartão dela; no computador, clique no botão **Editar** (o lápis) na linha da tabela. A ficha abre numa janela.
2. Para alterar dados ou cargo, edite e clique em **Salvar alterações**. Deixar a senha em branco mantém a atual.
3. Para tirar o acesso, clique em **Desativar usuário** e confirme. O cadastro e o histórico continuam. Para devolver o acesso, abra a ficha e clique em **Reativar usuário**.
4. O sistema impede duas coisas: desativar a **própria** conta e deixar o sistema **sem nenhum Administrador ativo** (seja desativando, seja trocando o cargo do último).

**Gerar uma senha temporária** (para quem esqueceu a senha)
1. Em **Usuários**, abra a ficha da pessoa e clique em **Gerar senha temporária**, confirmando em seguida.
2. A senha aparece **uma única vez**. Clique em **Copiar senha** e entregue à pessoa. Ao fechar a janela, ela não pode ser vista de novo.
3. A senha antiga deixa de valer na hora. Peça à pessoa que troque a senha em **Perfil** no primeiro acesso.

## Perguntas frequentes

**Entrei e não vejo "Usuários" nem "Relatórios".**
Essas duas telas formam o grupo **Gestão** da navegação e são só do Administrador. Se você precisa delas, peça a um Administrador para ajustar o seu cargo.

**Não vejo os botões Cadastrar, Editar e Excluir.**
No perfil Maquinista, as telas de trens, sensores e rotas são só de consulta — nelas, uma linha sob o título avisa que cadastro, edição e exclusão são da gestão. Em Alertas e Carga o Maquinista pode registrar itens.

**O painel mostra "Sem dados". Está com defeito?**
Não. Quer dizer que não há informação para mostrar: por exemplo, o painel de um Maquinista que ainda não tem trem vinculado, ou uma velocidade média sem leituras nas últimas 24 horas.

**O sistema não deixa excluir um trem, sensor ou rota.**
Esses itens têm outros registros ligados a eles. Trens com sensores, sensores com leituras e rotas com viagens ficam protegidos para não perder o histórico.

**Por que o sistema não deixa desativar uma conta?**
Um Administrador não pode desativar a própria conta, e o sistema nunca fica sem Administrador ativo. Peça a outro Administrador, ou deixe pelo menos um ativo.

**Digitei o endereço de uma tela e voltei para o início.**
O seu perfil não abre aquela tela. Use os itens da sua navegação.

**O arquivo exportado abriu com letras estranhas.**
O arquivo é preparado para abrir com acentos corretos nos editores de planilha. Se acontecer, abra o arquivo pela opção de importar dados da planilha e escolha a codificação UTF-8.

**O relatório impresso saiu sem cores.**
É proposital: no papel os selos e as barras saem em preto e branco. A situação aparece escrita, e o tamanho da barra mostra o valor.

**Posso mudar a minha foto ou o meu cargo?**
Não. A foto não pode ser trocada pelo sistema, e o cargo só é alterado por um Administrador.

**Meu telefone foi apagado e o antigo voltou.**
Em Usuários, deixar o telefone em branco mantém o antigo. Escreva o novo número no lugar. No seu **Perfil**, apagar o telefone funciona.
