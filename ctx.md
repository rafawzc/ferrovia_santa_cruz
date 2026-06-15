# Guia de Uniformização de Telas

**SESI / SENAI — Joinville Moinho**  
**Curso Técnico em Desenvolvimento de Sistemas — Integrado ao Ensino Médio**  
**Programação de Aplicativos · SA Projeto de Mapeamento de Ferrovias**

**Conjunto mínimo de telas para a aplicação ferroviária**  
Documento de referência para todas as equipes

## 1. Núcleo obrigatório (11 telas)

As telas a seguir constituem o mínimo que toda equipe deve contemplar na aplicação. Cada item indica o nome de arquivo padronizado e a entidade do banco de dados que representa.

### 1.1 Autenticação

- `login.html` — entrada por usuário e senha, com opção de recuperação e mensagem de erro para credencial inválida.
- `cadastro.html` — formulário com nome, e-mail, senha e confirmação. O tipo de usuário é definido por administrador, não no cadastro público.
- `recupera_senha.html` — solicitação por e-mail e redefinição de senha.

### 1.2 Painel principal

- `dashboard.html` — visão geral com indicadores centrais: contagem de trens por status, alertas ativos por severidade, sensores com leitura crítica, viagens em andamento e velocidade média da frota. O painel deve ocultar informações restritas dos usuários comuns, exibindo a cada perfil apenas o que lhe é pertinente.

### 1.3 Gestão

- `trens.html` — listagem e gestão de trens, com modelo, ano, status, capacidade e última inspeção; filtro por status. Tabela: `trens`.
- `sensores.html` — listagem e gestão de sensores, com tipo, localização, segmento e indicador da última leitura: normal, atenção ou crítico; filtro por tipo. Tabela: `sensores`.
- `rotas.html` — listagem e gestão de rotas, com trem, trajeto, horários e status; filtros por status, data, trem e rota. Concentra também o acompanhamento das viagens programadas. Tabela: `rotas`.
- `usuarios.html` — listagem e gestão de usuários, visível ao administrador/gerente; nome, e-mail, tipo, data de cadastro e status, com ações de adicionar, editar e desativar. Tabela: `usuarios`.
- `notificacoes_alertas.html` — central de notificações e alertas, com tipo, severidade, data e vínculo; filtros por severidade e tipo, com destaque visual para a severidade crítica. Tabelas: `alertas` e `notificacoes`.

### 1.4 Relatórios

- `gera_relatorio.html` — seleção de tipo: desempenho, consumo de energia, eficiência operacional e manutenção; período e filtros. Tabela: `relatorios`.
- `visualiza_relatorio.html` — modelo comum com filtros aplicados, tabela de dados, gráfico e botões de exportar e imprimir.

## 2. Telas opcionais (adendos)

As telas a seguir não são obrigatórias, mas agregam valor ao produto.

- **Perfil do usuário:** visualização e edição dos próprios dados.
- **Compra de passagens:** fluxo de aquisição de bilhetes pelo usuário.
- **Viagens (itinerários):** acompanhamento das viagens, caso a equipe opte por separá-las da tela de rotas.
- **Cadastro de estações e de rotas:** para administradores, com definição de origem, destino e segmentos.
- **Visualização em mapa:** representação espacial das estações e segmentos, com posição atual dos trens.

## 3. Diferenciação por perfil de usuário

O sistema atende a diferentes perfis de usuário. A interface deve apresentar conteúdo coerente com cada perfil. O mockup não precisa cobrir todas as visões completas, mas deve indicar essa diferenciação no protótipo.

| Perfil | Acesso típico |
|---|---|
| Usuário comum | Consulta de informações públicas e, se aplicável, compra de passagens e acompanhamento de viagens; sem acesso a dados restritos do painel. |
| Maquinista | Viagem própria, sensores em tempo real do trem operado e criação de alertas. |
| Administrador / Gerente | Acesso total, incluindo painel completo, gestão de usuários, trens, sensores, rotas e relatórios. |

## 4. Diretrizes de design e cor

As diretrizes a seguir consolidam pontos recorrentes observados nas apresentações e devem ser seguidas por todas as equipes.

### 4.1 Cor semântica de status

As cores verde, amarelo e vermelho representam, respectivamente, os estados normal, atenção e crítico, e devem ser preservadas independentemente da paleta do projeto. Gráficos e indicadores de status seguem essa convenção, e não a cor de marca.

### 4.2 Paleta de marca como acento

A cor de identidade rende mais como detalhe e acento do que como fundo dominante. Recomenda-se a proporção **60-30-10**: sessenta por cento de cor neutra, trinta por cento de cor secundária e dez por cento de cor de destaque ou marca.

### 4.3 Responsividade

A aplicação deve ser projetada com abordagem **mobile-first** e adaptada ao desktop. Listas de muitos registros, como trens, sensores e rotas, ficam melhores como tabela no desktop e como cartões empilhados no mobile.

### 4.4 Aproveitamento do espaço no desktop

No desktop, a largura deve ser usada para apresentar mais contexto simultâneo, como tabelas largas, painéis lado a lado e gráficos, evitando centralizar o layout mobile em coluna estreita com grandes margens vazias.

### 4.5 Dados fictícios realistas

Os dados de exemplo devem ser plausíveis: identificadores como `TR-204`, sensores como `S-TEMP-001`, datas e valores coerentes. Evitar marcadores genéricos como `AAA`, `BBB` ou o texto `LOGO` no lugar do logotipo.

### 4.6 Revisão final

Antes da entrega, realizar revisão ortográfica de todos os textos das telas e verificar a presença das duas versões: mobile e desktop.

## 5. Vocabulário padronizado

Para alinhar as telas ao modelo de dados, recomenda-se o uso da seguinte nomenclatura canônica: **usuários** — e não funcionários —, **trens** — e não frota, quando se referir à entidade — e **rotas** para os trajetos.

A tela de rotas concentra também as viagens programadas; equipes que preferirem podem destacá-las em uma tela opcional de viagens. O termo **itinerário** é tratado como sinônimo de viagem e será ajustado no banco de dados em momento posterior.
