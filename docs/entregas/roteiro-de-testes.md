# Roteiro de testes — Ferrovia Santa Cruz

**SESI / SENAI — Joinville Moinho** · Curso Técnico em Desenvolvimento de Sistemas
**SA — Projeto de Mapeamento de Ferrovias** · Aplicação **Ferrovia Santa Cruz**

**Integrantes:** Guilherme Wohl · Helena Kemczinski · Rafael Fodi · Yasmin Cota

> Roteiro de teste **manual**, de caixa preta: é o que se verifica clicando no sistema, na ordem em que um avaliador verificaria. O resultado esperado foi escrito **antes** da execução — é isso que faz do roteiro um teste e não uma conferência.
>
> Os testes automatizados do backend são outra coisa e rodam por `./fsc test` (pytest, banco trocado por fake). Eles cobrem contrato de API, papéis e validação; não cobrem SQL nem tela. Este roteiro cobre o que eles não alcançam.
>
> **Como executar:** em dupla, um opera e o outro anota; quem anota não dá dica. Antes de começar, `./fsc db:reset --yes && ./fsc up` para garantir banco recém-criado.
>
> **Falha encontrada não se apaga da tabela** — registra-se na observação que falhou e foi corrigida, com o commit da correção. Uma tabela toda verde na primeira passada é sinal de que o roteiro não foi executado de verdade.

## Ambiente da execução

| Item | Valor |
|------|-------|
| Data da execução | *a preencher* |
| Executado por | *a preencher* |
| Navegador | *a preencher* |
| Largura testada | 390px (mobile) e 1440px (desktop) |
| Banco | recém-criado por `./fsc db:reset --yes` |

## 1. Instalação e banco

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 1 | Importar `db/script.sql` num banco vazio | Cria as dez tabelas e a carga, sem erro | | |
| 2 | Importar o mesmo script uma segunda vez | Funciona de novo e deixa o banco no mesmo estado, sem duplicar registro | | |
| 3 | Subir o projeto em pasta limpa seguindo só o README (`./fsc up`) | Os três containers sobem saudáveis e `http://localhost:5173` abre | | |
| 4 | Conferir portas publicadas (`./fsc ps`) | Só o `frontend` publica porta; `backend` e `db` não | | |
| 5 | Consultar a senha de um usuário direto no banco (`./fsc db`) | Vem embaralhada (`$argon2id$...`), ilegível | | |

## 2. Autenticação, sessão e acesso

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 6 | Abrir o sistema sem estar logado | Mostra a tela de login | | |
| 7 | Entrar com senha errada | Mensagem de erro em português, sem entrar e sem revelar se o e-mail existe | | |
| 8 | Entrar com `ana.admin@ferrovia.com` / `ferrovia123` | Entra e vai para o painel | | |
| 9 | Recarregar uma tela interna já logado | Continua dentro do sistema | | |
| 10 | Abrir uma tela interna em janela anônima (`/admin/trens`) | Redireciona para o login | | |
| 11 | Conferir o topo da tela depois de entrar | Mostra o nome e o papel de quem está logado | | |
| 12 | Entrar como `carlos.maq@ferrovia.com` (maquinista) | O menu **não** mostra Usuários | | |
| 13 | Como maquinista, digitar `/admin/usuarios` direto no endereço | Acesso negado — a verificação é do servidor, não do menu | | |
| 14 | Entrar como `cliente@email.com` (comum) | Vê apenas informação pública; nenhuma tela de gestão abre | | |
| 15 | Sair pelo menu e apertar o botão voltar do navegador, recarregando com Ctrl+F5 | Volta para o login; não recupera o acesso | | |
| 16 | Desativar um usuário e tentar entrar com ele | Acesso negado com mensagem de conta desativada | | |

## 3. Cadastros (trens, sensores, rotas, carga)

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 17 | Cadastrar um trem com dados válidos | Aparece na listagem | | |
| 18 | Cadastrar um trem com o prefixo de um que já existe | Recusa com mensagem, sem gravar | | |
| 19 | Cadastrar um trem com campo obrigatório vazio e com ano fora da faixa | Mensagem por campo, sem gravar | | |
| 20 | Editar um trem e recarregar a página | A alteração persiste | | |
| 21 | Buscar por parte de um prefixo e filtrar por status na tela de trens | A lista reduz corretamente | | |
| 22 | Excluir um trem | Pede confirmação antes e remove depois | | |
| 23 | Excluir um trem que tem sensores vinculados | Recusa com mensagem clara, sem apagar nada | | |
| 24 | Cadastrar um sensor | O trem é escolhido numa lista vinda do banco, não digitado | | |
| 25 | Conferir a listagem de sensores | Mostra o prefixo do trem, não o número do identificador | | |
| 26 | Filtrar sensores por tipo | A lista reduz corretamente | | |
| 27 | Excluir um sensor que já tem leituras | Recusa com a mensagem de que há dados registrados | | |
| 28 | Cadastrar uma rota/viagem e filtrar por status e por trem | Grava e os filtros reduzem a lista | | |
| 29 | Cadastrar uma carga | Aparece na listagem com tipo, peso e destino | | |

## 4. Monitoramento, painel e alertas

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 30 | Conferir os cinco indicadores do painel contra o banco | Os números batem com as consultas do banco | | |
| 31 | Apagar todas as leituras do banco e recarregar o painel | A velocidade média mostra "sem dados", **não** zero | | |
| 32 | Rodar o simulador (`./fsc sim`) e recarregar o painel | Aparecem leituras novas e os indicadores mudam | | |
| 33 | Gerar pelo simulador uma leitura fora do limite | Nasce um alerta automático com a severidade correspondente | | |
| 34 | Filtrar a central de alertas por severidade e por tipo | A lista reduz e o crítico aparece destacado | | |
| 35 | Marcar um alerta como tratado | Sai da contagem de alertas ativos do painel | | |
| 36 | Criar um alerta logado como maquinista | É permitido (o Guia dá esse poder ao maquinista) | | |
| 37 | Entrar com os três perfis e comparar o painel | O conteúdo muda conforme o perfil | | |

## 5. Relatórios

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 38 | Gerar um relatório de desempenho com período | Mostra os filtros aplicados, a tabela e o gráfico | | |
| 39 | Gerar os outros três tipos (consumo, eficiência, manutenção) | Cada um traz os dados do seu tipo, agrupados por trem | | |
| 40 | Conferir o gráfico contra a tabela | As barras refletem os mesmos números, na escala certa | | |
| 41 | Escolher um período que termina hoje | Os registros de hoje entram no resultado | | |
| 42 | Exportar o relatório | Baixa um arquivo que abre no editor de planilhas, com acentos corretos | | |
| 43 | Imprimir o relatório (visualização de impressão) | Sai sem menu e sem botões | | |
| 44 | Recarregar o endereço do relatório gerado | Mostra o mesmo relatório (os parâmetros estão no endereço) | | |

## 6. Gestão de usuários

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 45 | Listar, buscar e filtrar usuários | A lista reduz corretamente | | |
| 46 | Editar um usuário | A alteração persiste | | |
| 47 | Tentar desativar a própria conta | O sistema impede, com mensagem | | |
| 48 | Tentar desativar o último administrador ativo | O sistema impede, com mensagem | | |
| 49 | Gerar senha temporária para um usuário | A senha aparece uma única vez e permite que ele entre | | |
| 50 | Conferir no banco a senha temporária gerada | Está embaralhada, nunca em texto | | |

## 7. Interface e qualidade

| # | O que se testa | Resultado esperado | Obtido | Situação |
|---|----------------|--------------------|--------|----------|
| 51 | Abrir cada tela a 390px e a 1440px | Listas viram cartões no celular e tabela no desktop; nada estoura | | |
| 52 | Conferir as cores de status | Normal verde, atenção amarelo, crítico vermelho em todas as telas | | |
| 53 | Navegar só com o teclado numa tela de formulário | O foco é visível e alcança todos os campos e botões | | |
| 54 | Abrir o console do navegador e percorrer as telas | Sem erro e sem warning do React | | |
| 55 | Desligar o container do banco (`docker compose stop db`) e usar o sistema | Mensagem de banco indisponível, sem tela branca e sem erro técnico cru | | |
| 56 | Rodar o gate do projeto (`./fsc check`) | Lint, typecheck, formatação, testes de backend e build do front passam | | |

## Resumo da execução

| Situação | Casos |
|----------|-------|
| Passou na primeira tentativa | *a preencher* |
| Falhou e foi corrigido | *a preencher* |
| Falhou e virou limitação conhecida | *a preencher* |
| Total | 56 |

As falhas corrigidas e as que viraram limitação estão detalhadas na seção *Limitações conhecidas* do [`README.md`](../../README.md).
