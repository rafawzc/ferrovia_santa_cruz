# Ferrovia Santa Cruz

![Ferrovia Santa Cruz](assets/logo.svg)

Sistema web de monitoramento da ferrovia Santa Cruz, feito como Situação de Aprendizagem (SA) de curso técnico. A documentação completa está na pasta [`docs/`](docs/CLAUDE.md); este arquivo é só a porta de entrada.

## 1. Equipe

Integrantes registrados em [`docs/PLANO_IMPLEMENTACAO.md`](docs/PLANO_IMPLEMENTACAO.md) (seção "Divisão entre integrantes"):

- Guilherme Wohl
- Helena Kemczinski
- Rafael Fodi
- Yasmin Cota

## 2. O que o sistema faz

O sistema reúne em um só lugar o acompanhamento de trens, sensores, rotas, viagens, cargas e alertas da ferrovia. Os sensores enviam leituras; quando uma leitura passa do limite, o sistema gera um alerta. O painel resume a situação e a tela de relatórios gera relatórios por período, com opção de exportar em CSV.

Há dois lados. O lado de gestão e operação (rotas que começam em `/admin`) é usado por quem administra e por quem opera os trens. O lado do usuário comum é a tela de viagens e o perfil, para quem só consulta.

O que cada perfil consegue:

- **Administrador:** tudo do lado de gestão, incluindo cadastro de usuários, redefinição de senha de outros usuários e geração de relatórios.
- **Maquinista:** painel, trens, sensores, rotas, alertas e carga. Não acessa usuários nem relatórios.
- **Usuário comum:** consulta as viagens e edita o próprio perfil.

Detalhes do contrato da API: [`docs/backend/api.md`](docs/backend/api.md). Requisitos: [`docs/entregas/requisitos.md`](docs/entregas/requisitos.md).

## 3. Tecnologias

| Camada | Tecnologia | Versão |
|--------|------------|--------|
| Frontend | React | 19 (`^19.3.0`) |
| Frontend | TypeScript | `~6.0.3` |
| Frontend | Vite | `^8.3.0` |
| Frontend | Tailwind CSS | `^4.3.3` |
| Frontend | React Router | `^7.18.4` |
| Frontend | TanStack Query | `^5.103.2` |
| Frontend (execução) | Node.js, imagem `node:24-slim` | 24 |
| Backend | Python, imagem `python:3.13-slim` | 3.13 |
| Backend | FastAPI, SQL puro com `mysql-connector-python` | sem fixar (ver `backend/pyproject.toml`) |
| Banco | MySQL, imagem `mysql:8.4` | 8.4 |
| Infraestrutura | Docker Compose, 3 serviços (`frontend`, `backend`, `db`) | - |

Arquitetura dos containers e da rede: [`docs/arquitetura/containers-e-rede.md`](docs/arquitetura/containers-e-rede.md).

## 4. Como instalar

Pré-requisitos: Docker (Docker Desktop no Windows e no macOS; Docker Engine com o plugin Compose no Linux), Python 3.10 ou mais novo e a porta `5173` livre. Não é preciso instalar Node: o script `fsc.py` usa o Python do computador só para se executar (não há nada para instalar com `pip`) e roda todo o resto dentro dos containers.

### Linux e macOS

```bash
git clone https://github.com/rafawzc/ferrovia_santa_cruz.git
cd ferrovia_santa_cruz
python3 fsc.py up
```

### Windows

Abra o Docker Desktop e espere ele ficar pronto. Depois, no PowerShell ou no Prompt de Comando:

```bat
git clone https://github.com/rafawzc/ferrovia_santa_cruz.git
cd ferrovia_santa_cruz
python fsc.py up
```

Na primeira execução o `fsc.py` cria o `.env` a partir do `.env.example`. O `up` constrói as imagens e sobe `db`, `backend` e `frontend`, nessa ordem, esperando cada um ficar saudável. A primeira subida do banco demora um pouco, porque ele carrega o `db/script.sql` (tabelas e dados de exemplo). Se faltar algo (Docker não instalado ou fechado, plugin Compose ausente, porta `5173` ocupada), o script avisa em uma linha o que fazer. Por padrão ele mostra só um passo por linha; `-v` (ou `--verboso`) mostra a saída completa.

Quando terminar, abra http://localhost:5173 e entre com um dos usuários da próxima seção.

Comandos úteis (no Windows, use `python` no lugar de `python3`):

```bash
python3 fsc.py logs          # acompanha os logs
python3 fsc.py down          # derruba tudo
python3 fsc.py db:reset      # apaga o banco de dev e recria do db/script.sql (pede confirmação)
python3 fsc.py sim           # envia leituras simuladas de sensores (com o sistema no ar)
python3 fsc.py help          # lista todos os comandos
```

Para rodar a verificação completa (lint, typecheck, formatação, testes do backend e build do frontend):

```bash
python3 fsc.py check
```

Guia de operação: [`docs/arquitetura/operacao.md`](docs/arquitetura/operacao.md).

## 5. Usuários de teste

A senha de todos é `ferrovia123`. Valem apenas para o banco de desenvolvimento.

| E-mail | Senha | Perfil na interface | O que vê |
|--------|-------|---------------------|----------|
| `ana.admin@ferrovia.com` | `ferrovia123` | Administrador | Todas as telas de gestão, usuários e relatórios |
| `bruna.rh@ferrovia.com` | `ferrovia123` | Administrador (cargo RH) | O mesmo que a Ana |
| `carlos.maq@ferrovia.com` | `ferrovia123` | Maquinista | Painel, trens, sensores, rotas, alertas e carga |
| `cliente@email.com` | `ferrovia123` | Usuário comum | Viagens e perfil |

## 6. Telas do sistema

| Rota | Tela | Quem acessa |
|------|------|-------------|
| `/login` | Login | Público |
| `/cadastro` | Cadastro | Público |
| `/recuperar-senha` | Recuperar senha | Público |
| `/admin` | Painel | Maquinista, Administrador |
| `/admin/trens` | Trens | Maquinista, Administrador |
| `/admin/sensores` | Sensores | Maquinista, Administrador |
| `/admin/rotas` | Rotas | Maquinista, Administrador |
| `/admin/alertas` | Alertas | Maquinista, Administrador |
| `/admin/carga` | Carga | Maquinista, Administrador |
| `/admin/usuarios` | Usuários | Administrador |
| `/admin/relatorios` | Gerar relatório | Administrador |
| `/admin/relatorios/ver` | Visualizar relatório | Administrador |
| `/viagens` | Viagens do cliente | Usuário comum |
| `/perfil` | Perfil | Todos os perfis autenticados |

A rota `/ui` é uma vitrine do design system, sem login. Documentação por tela: [`docs/frontend/telas/`](docs/frontend/telas/auth.md) e [`docs/frontend/dados-e-rotas.md`](docs/frontend/dados-e-rotas.md).

## 7. Decisões tomadas

Cada linha traz o veredito; a justificativa está no arquivo ligado.

| Decisão | Veredito | Por quê |
|---------|----------|---------|
| Backend | FastAPI, API REST sob `/api` | [por quê](docs/decisoes/stack.md) |
| Banco | MySQL com SQL puro, sem ORM, queries parametrizadas | [por quê](docs/decisoes/stack.md) |
| Frontend | React com Vite | [por quê](docs/decisoes/stack.md) |
| Infraestrutura | Docker Compose, 3 containers, só o frontend exposto | [por quê](docs/decisoes/stack.md) |
| Estilo e qualidade do front | Tailwind v4, shadcn/ui, TypeScript strict, lint do design system, sem teste de front, CI com `python3 fsc.py check` | [por quê](docs/decisoes/frontend-e-qualidade.md) |
| E1 | Viagem é tabela própria, não campo de `linha` | [por quê](docs/decisoes/fechamento-sa.md) |
| E2 | Gráfico feito em CSS, sem biblioteca | [por quê](docs/decisoes/fechamento-sa.md) |
| E3 | Senha redefinida pelo administrador | [por quê](docs/decisoes/fechamento-sa.md) |
| E4 | `alerta` ganha tipo, severidade e tratado; não há tabela `notificacoes` | [por quê](docs/decisoes/fechamento-sa.md) |
| E5 | Alerta ativo é o alerta não tratado | [por quê](docs/decisoes/fechamento-sa.md) |
| E6 | Unicidade do prefixo do trem garantida pelo banco | [por quê](docs/decisoes/fechamento-sa.md) |
| E7 | `ultima_leitura` é calculada, não armazenada | [por quê](docs/decisoes/fechamento-sa.md) |
| E8 | Limites de sensor são constantes no serviço | [por quê](docs/decisoes/fechamento-sa.md) |
| E9 | Um único `db/script.sql`, destrutivo e idempotente | [por quê](docs/decisoes/fechamento-sa.md) |
| E10 | Geração de relatório sem estado; a tabela `relatorio` não é escrita | [por quê](docs/decisoes/fechamento-sa.md) |
| Telas obrigatórias | Alinhamento com o Guia de Uniformização de Telas | [por quê](docs/decisoes/uniformizacao-telas.md) |

## 8. Limitações conhecidas

- **Sem teste automatizado no frontend.** É decisão registrada; as telas são conferidas à mão, no navegador. Só o backend tem testes (`backend/tests/`). Ver [`docs/decisoes/frontend-e-qualidade.md`](docs/decisoes/frontend-e-qualidade.md).
- **Atualização parcial não limpa campos.** O `PATCH` de trens, sensores, rotas e usuários usa `COALESCE` no `UPDATE`; enviar `null` mantém o valor atual em vez de apagá-lo.
- **A listagem de usuários não tem busca nem filtro.** `GET /api/usuarios` não recebe parâmetros e devolve todos, ordenados por nome.
- **Não há leitura de dispositivo real.** As leituras entram por `POST` com chave de API; quem as produz hoje é o simulador (`python3 fsc.py sim`).
- **Recuperar senha não envia e-mail.** A tela pública responde sempre a mesma mensagem; quem redefine a senha é o administrador, que gera uma senha temporária. Ver E3 acima.
- **A tabela `relatorio` não é usada pela geração.** Os relatórios são calculados na hora, sem gravar o pedido. Ver E10 acima.
- **Importar o `db/script.sql` apaga os dados existentes.** É um script de criação, não de migração (E9).

## 9. Uso de inteligência artificial

Foi usado um agente de IA como par de programação na implementação. As instruções que orientam o agente estão versionadas no repositório (`.claude/CLAUDE.md` e `.opencode/AGENTS.md`), junto com a documentação que ele deveria manter atualizada.

Feito com assistência da IA: escrita e refatoração de código (frontend, backend e SQL), testes do backend, e rascunho da documentação em `docs/`.

Decidido e revisado por pessoas da equipe: arquitetura, escolha da stack, modelagem do banco, as decisões registradas em `docs/decisoes/` e a aceitação de todo o código. Nada entra sem ser revisado por um integrante.

Como o trabalho foi verificado: o comando `python3 fsc.py check` (lint, typecheck, formatação, testes do backend e build do frontend), que o CI também roda em todo PR, e a conferência manual das telas no navegador, em mobile e desktop. Casos de teste manual: [`docs/entregas/roteiro-de-testes.md`](docs/entregas/roteiro-de-testes.md).
