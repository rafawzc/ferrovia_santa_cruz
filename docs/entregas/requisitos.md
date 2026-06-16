# Requisitos Funcionais e Não Funcionais — Ferrovia Santa Cruz

**SESI / SENAI — Joinville Moinho** · Curso Técnico em Desenvolvimento de Sistemas (Integrado ao Ensino Médio)
**SA — Projeto de Mapeamento de Ferrovias** · Aplicação **Ferrovia Santa Cruz**

**Integrantes:** Guilherme Wohl · Helena Kemczinski · Rafael Fodi · Yasmin Cota

> Especificação dos requisitos da aplicação web de **gestão** (admin) e **informação** (admin + cliente) da ferrovia. Escopo: **sistema completo da SA**, incluindo o lado de monitoramento IoT (trens, sensores, leituras, relatórios) já modelado no banco. Cada requisito é rastreado à sua origem — o **Guia de Uniformização de Telas (SENAI)** e os documentos internos do grupo ([`PLANO_IMPLEMENTACAO.md`](../PLANO_IMPLEMENTACAO.md), [`decisoes/uniformizacao-telas.md`](../decisoes/uniformizacao-telas.md), [`decisoes/stack.md`](../decisoes/stack.md), [`arquitetura/containers-e-rede.md`](../arquitetura/containers-e-rede.md), [`banco/modelo-de-dados.md`](../banco/modelo-de-dados.md)).

## Convenções

- **RFnn** — Requisito Funcional (o que o sistema **faz**). **RNFnn** — Requisito Não Funcional (atributo de qualidade: como o sistema **deve ser**).
- **Prioridade:**
  - **Essencial** — sem ele a entrega não atende ao mínimo da SA (núcleo obrigatório do Guia de Uniformização e regras firmes do grupo).
  - **Desejável** — agrega valor; opcional segundo o Guia ou adiável sem comprometer a entrega.
- **Origem** — de onde o requisito vem, para rastreabilidade. `Guia §x` = Guia de Uniformização de Telas (SENAI); `PLANO §x` = plano de implementação do grupo.

---

## 1. Requisitos Funcionais

### 1.1 Autenticação e sessão

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF01 | Autenticar usuário por e-mail e senha; exibir mensagem de erro para credencial inválida. | Essencial | Guia §1.1; PLANO §5 |
| RF02 | Cadastro público com nome, e-mail, senha e confirmação de senha. O tipo de usuário **não** é escolhido no cadastro — todo novo usuário nasce como **comum**. | Essencial | Guia §1.1; PLANO §2, §5 |
| RF03 | Recuperar/redefinir senha: solicitação por e-mail e redefinição. | Essencial | Guia §1.1 (`recupera_senha`) |
| RF04 | Encerrar sessão (logout); acesso sem sessão é redirecionado para o login. | Essencial | PLANO §5 (Fluxo 6) |

### 1.2 Perfis e controle de acesso

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF05 | Suportar três perfis derivados do cargo do usuário: **comum** (cliente), **operacional** (maquinista) e **gestão** (administrador/gerente). | Essencial | Guia §3; PLANO §5 |
| RF06 | Restringir cada tela/ação ao perfil pertinente; o painel oculta informações restritas de quem não tem acesso. | Essencial | Guia §1.2, §3; PLANO §5 |
| RF07 | Definição/alteração do cargo de um usuário é feita por administrador, nunca no cadastro público. | Essencial | Guia §1.1; PLANO §2 |

### 1.3 Painel (Dashboard)

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF08 | Apresentar indicadores centrais: contagem de trens por status, alertas ativos por severidade, sensores com leitura crítica, viagens em andamento e velocidade média da frota. | Essencial | Guia §1.2 |
| RF09 | Exibir a cada perfil apenas o conteúdo pertinente, ocultando dados restritos do usuário comum. | Essencial | Guia §1.2 |

### 1.4 Gestão de Rotas

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF10 | Listar e gerir rotas com trem, trajeto, horários e status; filtros por status, data, trem e rota. | Essencial | Guia §1.3 |
| RF11 | Acompanhar as viagens programadas a partir da tela de rotas. | Essencial | Guia §1.3 |

### 1.5 Trens

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF12 | Listar e gerir trens com modelo, ano, status, capacidade e última inspeção; filtro por status. | Essencial | Guia §1.3 |

### 1.6 Sensores e monitoramento

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF13 | Listar e gerir sensores com tipo, localização, segmento e indicador da última leitura (normal / atenção / crítico); filtro por tipo. | Essencial | Guia §1.3 |
| RF14 | Cadastrar sensor vinculado a um trem. | Essencial | PLANO §5 |
| RF15 | Excluir um sensor somente após confirmação explícita do usuário. | Essencial | PLANO §3, §5 (Fluxo 5) |
| RF16 | Impedir a exclusão de sensor que possua leituras registradas, exibindo mensagem clara ("não é possível excluir sensores com dados registrados"). | Essencial | PLANO §2, §3 |
| RF17 | Exibir as leituras em tempo real (velocidade, localização, status operacional: normal / alerta / falha). | Essencial | PLANO §5 (Fluxo 2) |
| RF18 | A partir de uma leitura crítica, navegar até o sensor e o trem afetado. | Essencial | PLANO §5 (Fluxo 2) |

### 1.7 Carga

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF19 | Listar a carga (tipo, peso, destino). | Essencial | PLANO §3, §5 |
| RF20 | Cadastrar carga. | Essencial | PLANO §5 |

### 1.8 Usuários (gestão)

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF21 | Listar e gerir usuários (visível ao administrador/gerente) com nome, e-mail, tipo, data de cadastro e status; ações de adicionar, editar e desativar. | Essencial | Guia §1.3; PLANO §5 |
| RF22 | Impedir que o administrador desative a própria conta. | Essencial | PLANO §5 (Fluxo 3) |

### 1.9 Notificações e Alertas

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF23 | Central de notificações e alertas com tipo, severidade, data e vínculo; filtros por severidade e tipo, com destaque visual para a severidade crítica. | Essencial | Guia §1.3 |
| RF24 | Criar alerta vinculado a uma rota. | Essencial | PLANO §5 |
| RF25 | Permitir que o maquinista (operacional) crie alertas. | Essencial | Guia §3; decisoes/uniformizacao-telas §5 |

### 1.10 Relatórios

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF26 | Gerar relatório selecionando o tipo (desempenho, consumo de energia, eficiência operacional, manutenção), período e filtros. | Essencial | Guia §1.4 |
| RF27 | Visualizar relatório com filtros aplicados, tabela de dados, gráfico e ações de exportar e imprimir. | Essencial | Guia §1.4 |

### 1.11 Perfil do cliente

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF28 | Usuário comum visualiza os próprios dados. | Essencial | Guia §2; PLANO §5 |
| RF29 | Usuário comum edita os próprios dados. | Essencial | PLANO §5 |

### 1.12 Feedback ao usuário

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF30 | Toda ação concluída exibe feedback de sucesso ou de erro ao usuário. | Essencial | PLANO §3, §5 |

### 1.13 Funcionalidades desejáveis (opcionais)

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RF31 | Compra de passagens pelo usuário (fluxo de aquisição de bilhetes). | Desejável | Guia §2 |
| RF32 | Tela dedicada de viagens/itinerários, separada de rotas. | Desejável | Guia §2 |
| RF33 | Cadastro de estações e de rotas (origem, destino, segmentos) para administradores. | Desejável | Guia §2 |
| RF34 | Visualização em mapa: estações, segmentos e posição atual dos trens. | Desejável | Guia §2 |

---

## 2. Requisitos Não Funcionais

### 2.1 Usabilidade e interface

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RNF01 | Interface **responsiva mobile-first**, funcional de 390px (mobile) a 1440px (desktop); listas extensas como tabela no desktop e cards empilhados no mobile, aproveitando a largura no desktop. | Essencial | Guia §4.3, §4.4; PLANO §6 |
| RNF02 | Cores semânticas de status **fixas**: normal=verde, atenção=amarelo, crítico=vermelho — preservadas independentemente da paleta de marca. | Essencial | Guia §4.1 |
| RNF03 | Identidade visual consistente: paleta de marca como acento (proporção 60-30-10), tipografia Poppins, valores consumidos de tokens centralizados (sem hex chumbado). | Essencial | Guia §4.2; PLANO §1, §6 |
| RNF04 | Acessibilidade básica: `alt` em imagens, `label` associado a cada input e foco de teclado visível. | Essencial | PLANO §6 |
| RNF05 | Estados visuais tratados em toda tela (loading, erro, vazio) e em todo componente interativo (hover, foco, desabilitado, erro) — sem tela branca ou quebra. | Essencial | PLANO §6 |
| RNF06 | Dados de exemplo plausíveis (ex.: `TR-204`, `S-TEMP-001`), sem marcadores genéricos (`AAA`, `LOGO`). | Desejável | Guia §4.5 |
| RNF07 | Revisão ortográfica de todos os textos e presença das duas versões (mobile e desktop) antes da entrega. | Essencial | Guia §4.6; PLANO §6 |

### 2.2 Arquitetura e infraestrutura

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RNF08 | Stack fixa do projeto: React + Vite (frontend), FastAPI / API REST (backend), MySQL 8 com SQL puro (sem ORM), tudo em Docker Compose. | Essencial | decisoes/stack.md; PLANO §1 |
| RNF09 | Três containers (`frontend`, `backend`, `db`) em rede interna; **apenas o frontend é exposto** — backend e banco nunca publicam porta. | Essencial | arquitetura/containers-e-rede.md |
| RNF10 | O frontend chama a API por **caminho relativo `/api/...`** (proxy do Vite), nunca por URL absoluta do backend. | Essencial | arquitetura/containers-e-rede.md |
| RNF11 | Orquestração com `depends_on` em cadeia `db → backend → frontend` usando `condition: service_healthy`. | Essencial | arquitetura/containers-e-rede.md |
| RNF12 | Conexão ao banco centralizada num único módulo, com pool e fechamento de cursor/conexão garantidos (sem conexão crua espalhada). | Essencial | backend/acesso-a-dados.md; PLANO §2 |

### 2.3 Segurança

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RNF13 | **Toda** query com valor externo é parametrizada (placeholders `%s`); proibida interpolação/concatenação de SQL — proteção contra SQL injection. | Essencial | decisoes/stack.md; backend/acesso-a-dados.md |
| RNF14 | Senha armazenada com hash (`senha_hash`), nunca em texto puro. | Essencial | banco/modelo-de-dados.md |
| RNF15 | Segredos (senha do MySQL etc.) vêm de variável de ambiente / `.env` gitignored — nunca hardcoded nem commitados. | Essencial | decisoes/stack.md |
| RNF16 | Input validado na fronteira com Pydantic; erro de validação retorna 4xx com mensagem clara, nunca 500 silencioso. | Essencial | PLANO §1; backend/acesso-a-dados.md |

### 2.4 Integridade de dados

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RNF17 | Integridade referencial garantida no schema; sensor com leituras não pode ser excluído (`ON DELETE RESTRICT`) — a regra mora no banco, a API só traduz o erro. | Essencial | banco/modelo-de-dados.md; PLANO §2 |
| RNF18 | Novo usuário nasce com cargo **comum** por padrão (`DEFAULT`); promoção de cargo só por administrador. | Essencial | banco/modelo-de-dados.md; PLANO §2 |

### 2.5 Qualidade e manutenibilidade

| ID | Requisito | Prioridade | Origem |
|----|-----------|------------|--------|
| RNF19 | UI componentizada: o que se repete vira componente reutilizável; CSS por componente (CSS Modules) + tokens globais; JSX semântico; sem estilo inline. | Essencial | PLANO §2, §3, §6 |
| RNF20 | Testes automatizados: Vitest (frontend) e pytest (backend), rodados no container; ao menos um teste de render/interação por tela. | Essencial | PLANO §6; .claude/CLAUDE.md (Testes) |
| RNF21 | Console limpo: sem erros nem warnings do React (inclui `key` em listas). | Essencial | PLANO §6 |
| RNF22 | Versionamento com conventional commits, revisão por ≥1 integrante e contribuição dos quatro ao longo do tempo (sem commit único no fim). | Essencial | PLANO §6 |

---

## 3. Lacunas / a definir

> Itens **não especificados por escrito** em nenhuma fonte do projeto. Não foram inventados aqui — ficam registrados para o grupo (e a professora) decidirem. Resolver e promover a RF/RNF quando definidos.

- **Capacidades avaliadas (CT/CS) desta atividade** — o `PLANO_IMPLEMENTACAO.md` cita CT6/CT13/CS3 da Entrega 2; quais capacidades este documento de requisitos atende não está escrito.
- **Mecanismo de sessão/autenticação** — o plano menciona "token", mas não define a tecnologia (JWT, sessão, etc.) nem expiração.
- **Toggle "permitir localização"** (presente no mockup de Login/Cadastro) — qual função ele dispara não está especificado.
- **Desempenho** — não há meta escrita de tempo de resposta, carga simultânea ou volume de dados.
- **Compatibilidade de navegadores** — versões/navegadores-alvo não definidos.
- **Privacidade / LGPD** — o cadastro coleta dados pessoais (e-mail); não há requisito escrito de consentimento, retenção ou exclusão de dados.
- **Disponibilidade / backup** — não há requisito escrito de uptime, recuperação ou rotina de backup do banco.
</content>
</invoke>
