# Manual do usuário — Ferrovia Santa Cruz

## Apresentação

A **Ferrovia Santa Cruz** é um sistema para acompanhar a ferrovia pelo navegador, no computador ou no celular. Ele reúne em um só lugar os trens, os sensores instalados neles, as rotas, as viagens, as cargas e os alertas.

Os sensores enviam leituras (velocidade, temperatura, consumo de energia e outras). Quando uma leitura passa do limite, o sistema cria um alerta. O painel inicial resume a situação, e quem administra o sistema pode gerar relatórios por período e levá-los para uma planilha ou para o papel.

O que cada pessoa vê depende do seu perfil: **Usuário comum**, **Maquinista** ou **Administrador**. A seção "Os perfis" explica a diferença.

## Como acessar

1. Abra o endereço do sistema no navegador. Se você não estiver conectado, aparece a tela de entrada.
2. Digite o seu **e-mail** e a sua **senha** e entre. Cada pessoa vai para a sua tela inicial: o Usuário comum cai em **Viagens**; Maquinista e Administrador caem no painel.
3. No alto da tela aparece "Conectado como", com o seu nome e o seu cargo, e o botão **Sair**. Use-o ao terminar, principalmente em computador compartilhado.
4. O menu fica na parte de baixo da tela. Em telas pequenas, só o item aberto mostra o nome; passe o dedo ou o mouse sobre os outros ícones para ver o nome deles.
5. No canto superior direito há um botão para trocar entre o tema claro e o escuro.

**Não tenho conta.** Na tela de entrada, escolha "Criar Conta", preencha nome, e-mail, senha (de 8 a 128 caracteres) e confirmação da senha, e marque o aceite dos termos. A conta nasce sempre como **Usuário comum**. Depois de criada, você volta à tela de entrada para fazer o primeiro acesso. Contas de teste estão no [README](../../README.md).

**Esqueci a minha senha.** A opção "Esqueceu sua senha?" da tela de entrada **não envia e-mail**. Peça a um Administrador que gere uma senha temporária para você (veja "Tarefas principais" do Administrador). Depois de entrar, troque a senha em **Perfil**.

## Os perfis

| Perfil | Para quem é | O que vê no menu |
|--------|-------------|------------------|
| **Usuário comum** | Quem só consulta as viagens | Viagens e Perfil |
| **Maquinista** | Equipe que opera os trens | Início, Trens, Sensores, Rotas, Alertas, Carga e Perfil |
| **Administrador** | Quem gerencia o sistema | Início, Trens, Sensores, Rotas, Alertas, Carga, Relatórios, Usuários e Perfil |

- **Usuário comum** consulta as viagens e edita o próprio perfil. Não abre nenhuma tela de gestão.
- **Maquinista** acompanha o painel (só do trem que opera), trens, sensores, rotas e viagens, e também registra alertas e cargas. Nessas telas ele **só olha**: os botões para cadastrar, editar e excluir não aparecem para ele. Não acessa Usuários nem Relatórios.
- **Administrador** faz tudo o que o Maquinista faz e mais: cadastra, edita e exclui trens, sensores, rotas e viagens, gerencia os usuários e gera relatórios.

O perfil é definido pelo **cargo** da pessoa, e só um Administrador troca o cargo de alguém. Ninguém muda o próprio perfil. O cargo aparece no alto da tela (por exemplo, "Eletricista" ou "RH"); um Eletricista tem o perfil Maquinista, e um RH tem o perfil Administrador.

Se você digitar o endereço de uma tela que o seu perfil não abre, o sistema volta para a sua tela inicial.

## Tarefas principais

### Para todos

**Trocar o nome, o telefone ou a senha**
1. Abra **Perfil** no menu.
2. Altere Nome, Email ou Telefone. Para trocar a senha, digite a **Nova senha** (mínimo de 8 caracteres); aparece o campo **Senha atual**, que você deve preencher.
3. Clique em **Salvar**. O aviso "Perfil atualizado" confirma.

A foto não pode ser trocada.

### Usuário comum: consultar viagens

1. Abra **Viagens**. A lista mostra as viagens da ferrovia, da mais recente para a mais antiga, com rota, trajeto, trem, partida, chegada e situação.
2. Para reduzir a lista, escolha uma situação (por exemplo, Em andamento) ou um dia.

### Maquinista e Administrador

**Ler o painel**
1. Abra **Início**. O painel mostra três números: viagens em andamento, velocidade média e sensores críticos. Abaixo, dois gráficos: trens por situação e alertas ativos por gravidade.
2. O Maquinista vê só o trem que opera ("Dashboard do seu trem"); o Administrador vê a ferrovia inteira.
3. "Sem dados" significa que não há informação para mostrar. Não é o mesmo que zero.

**Consultar trens, sensores e rotas**
1. Abra **Trens**, **Sensores** ou **Rotas**.
2. Em Trens, use a busca por prefixo ou modelo e o filtro de situação. Em Sensores, filtre por tipo; a coluna "Última leitura" mostra se o sensor está Normal, em Atenção ou Crítico. Em Rotas, a aba **Rotas** lista as rotas e a aba **Viagens** lista as viagens, com filtros de situação, rota, trem e dia.

**Registrar um alerta**
1. Abra **Alertas**.
2. No formulário "Novo alerta", escolha a Rota e preencha Tipo, Severidade, Motivo e Status. O Tempo de espera é opcional.
3. Clique em **Enviar**. O aviso "Alerta enviado" confirma.

**Tratar um alerta**
1. Em **Alertas**, a central lista por padrão os alertas **Não tratados**. Filtre por severidade, tipo ou situação se precisar.
2. No alerta resolvido, clique em **Marcar como tratado**. Ele sai da lista de pendentes e deixa de contar no painel. Para voltar atrás, mude a situação para "Tratados" ou "Todos" e clique em **Reabrir**.
3. Alertas críticos ainda não tratados aparecem com borda vermelha.

**Cadastrar uma carga**
1. Abra **Carga** e clique em **Cadastrar**.
2. Informe tipo, peso, partida e destino. Vagão e número do trem são opcionais; deixe em branco o que não souber.
3. Confirme. O aviso "Carga cadastrada" aparece e a carga entra na lista.

### Somente o Administrador

**Cadastrar, editar ou excluir trens, sensores, rotas e viagens**
1. Abra **Trens**, **Sensores** ou **Rotas**. Para criar, clique em **Cadastrar** (em Rotas: **Cadastrar rota**, ou **Programar viagem** na aba Viagens).
2. Preencha o formulário e confirme. Para alterar, use **Editar** no item; para remover, **Excluir** e confirme na pergunta que aparece.
3. Alguns itens não podem ser excluídos: trem com sensores vinculados, sensor que já tem leituras e rota com viagens. O sistema avisa e não apaga nada.
4. Uma informação opcional já preenchida (última inspeção ou rota do trem, segmento do sensor) pode ser trocada por outra, mas não apagada. O sistema avisa no próprio formulário.

**Gerar um relatório**
1. Abra **Relatórios**.
2. Escolha o **Tipo de relatório** (Desempenho, Consumo de energia, Eficiência operacional ou Manutenção), a **Data inicial** e a **Data final**. Se quiser, escolha um **Trem**; o padrão é "Todos os trens".
3. Clique em **Gerar relatório**. A tela mostra o resumo, a tabela e o gráfico.
4. Para **levar para uma planilha**, clique em **Exportar CSV**: o arquivo é baixado e abre com os acentos corretos.
5. Para **imprimir**, clique em **Imprimir**. A folha sai só com o relatório, sem menu e sem botões, em preto sobre branco. As cores de situação não saem no papel; leia pelo texto.
6. Para fazer outro, clique em **Novo relatório**.

**Cadastrar um usuário**
1. Abra **Usuários** e clique em **Cadastrar**.
2. Informe nome, e-mail, telefone (opcional), **cargo** e senha de pelo menos 8 caracteres. O cargo define o perfil da pessoa.
3. Confirme. O aviso "Usuário cadastrado" aparece. Use a busca e os filtros de nível de acesso e situação para achar alguém depois.

**Editar, desativar ou reativar um usuário**
1. Em **Usuários**, clique no nome da pessoa para abrir a ficha.
2. Para alterar dados ou cargo, edite e clique em **Salvar**. Deixar a senha em branco mantém a atual.
3. Para tirar o acesso, clique em **Desativar usuário** e confirme. O cadastro e o histórico continuam. Para devolver o acesso, abra a ficha e clique em **Reativar usuário**.
4. O sistema impede duas coisas: desativar a **própria** conta e deixar o sistema **sem nenhum Administrador ativo** (seja desativando, seja trocando o cargo do último).

**Gerar uma senha temporária** (para quem esqueceu a senha)
1. Em **Usuários**, abra a ficha da pessoa e clique em **Gerar senha temporária**, confirmando em seguida.
2. A senha aparece **uma única vez**. Clique em **Copiar senha** e entregue à pessoa. Ao fechar a janela, ela não pode ser vista de novo.
3. A senha antiga deixa de valer na hora. Peça à pessoa que troque a senha em **Perfil** no primeiro acesso.

## Perguntas frequentes

**Entrei e não vejo o menu "Usuários" ou "Relatórios".**
Essas telas são só do Administrador. Se você precisa delas, peça a um Administrador para ajustar o seu cargo.

**Não vejo os botões Cadastrar, Editar e Excluir.**
No perfil Maquinista, as telas de trens, sensores e rotas são só de consulta. Em Alertas e Carga o Maquinista pode registrar itens.

**O painel mostra "Sem dados". Está com defeito?**
Não. Quer dizer que não há informação para mostrar: por exemplo, o painel de um Maquinista que ainda não tem trem vinculado, ou uma velocidade média sem leituras nas últimas 24 horas.

**O sistema não deixa excluir um trem, sensor ou rota.**
Esses itens têm outros registros ligados a eles. Trens com sensores, sensores com leituras e rotas com viagens ficam protegidos para não perder o histórico.

**Por que o sistema não deixa desativar uma conta?**
Um Administrador não pode desativar a própria conta, e o sistema nunca fica sem Administrador ativo. Peça a outro Administrador, ou deixe pelo menos um ativo.

**Digitei o endereço de uma tela e voltei para o início.**
O seu perfil não abre aquela tela. Use os itens do seu menu.

**O arquivo exportado abriu com letras estranhas.**
O arquivo é preparado para abrir com acentos corretos nos editores de planilha. Se acontecer, abra o arquivo pela opção de importar dados da planilha e escolha a codificação UTF-8.

**O relatório impresso saiu sem cores.**
É proposital: no papel os selos e as barras saem em preto e branco. A situação aparece escrita, e o tamanho da barra mostra o valor.

**Posso mudar a minha foto ou o meu cargo?**
Não. A foto não pode ser trocada pelo sistema, e o cargo só é alterado por um Administrador.

**Meu telefone foi apagado e o antigo voltou.**
Em Usuários, deixar o telefone em branco mantém o antigo. Escreva o novo número no lugar. No seu **Perfil**, apagar o telefone funciona.
