# Alinhamento com o Guia de Uniformização (`ctx.md`)

> Status: **BRAINSTORMING** — decisões de alinhamento travadas; restam deltas de banco a confirmar com o grupo (§9).
> Owner: guiwohl · Criado: 2026-06-15
> Plano de record do **alinhamento** entre o [`ctx.md`](../../ctx.md) (Guia de Uniformização de Telas — SENAI, vale pra todas as equipes) e o [`PLANO_IMPLEMENTACAO.md`](../PLANO_IMPLEMENTACAO.md) (plano do grupo). Doc transversal: vale pros 4 módulos. Cada integrante constrói o módulo dele a partir daqui.

---

## 1. Objetivo

O `ctx.md` chegou depois do plano do grupo e é uma **uniformização mais rígida**: fixa **11 telas obrigatórias** com nomes padronizados, **vocabulário canônico** e diretrizes de design comuns a todas as equipes. Ele conflita com decisões já vivas (nomes de entidade, módulos dos integrantes) e força telas que o grupo tinha como pendência. Este doc reconcilia os dois: trava as decisões de alinhamento, mapeia cada tela exigida pro plano existente, e lista os deltas de banco/UI por dono. **Nenhum código de app nesta rodada** — é planejamento (P0 *Planning First*).

---

## 2. Decisões travadas

| # | Decisão | Detalhe |
|---|---------|---------|
| L1 | **Vocabulário: UI adota o `ctx`, banco mantém** | "Rotas" e "Usuários" nas labels e nas rotas do front; as tabelas seguem `linha` e `usuario`; a camada `services/` traduz. **Sem migração de renomeação** no banco já entregue. |
| L2 | **`notificacoes_alertas`: usar AMBOS** | Mantém `alerta` (alerta manual sobre uma `linha`) **e adiciona** uma tabela `notificacoes` (notificação dirigida ao usuário). A tela agrega os dois. Forma exata da tabela = aberto (§9 O1). |
| L3 | **Escopo desta rodada: só-doc** | Reconciliação no papel. Scaffold de front/back e construção das telas vêm depois, por módulo/dono, cada um via `/tdd`. |
| L4 | **`.html` do `ctx` = ID lógico de tela → página React** | Os nomes `login.html`, `rotas.html`… são identificadores de tela, não arquivos `.html`. Mapeiam pra páginas React (decisão já registrada no PLANO §1; reafirmada). |
| L5 | **Obrigatórias sobem de 7 → 11** | Auth ganha `recupera_senha`; relatório vira `gera_relatorio` + `visualiza_relatorio`; `trens` e `sensores` viram telas próprias; `notificacoes_alertas` explícita. |
| L6 | **Cor de status é fixa-semântica** (`ctx` §4.1) | normal=verde · atenção=amarelo · crítico=vermelho. Nunca tingida com a cor de marca. Resolve a pendência #2 do PLANO (guia monocromático sem cor de status). |
| L7 | **Mapa de status do banco → rótulo/cor da UI** | `leitura_sensor.status_operacional`: `normal`→Normal/verde · `alerta`→Atenção/amarelo · `falha`→Crítico/vermelho. `linha.status`: `manutencao`→amarelo · `atraso`→laranja · `fechado`→vermelho · `na_estacao`/`ja_partiu`→verde (já no PLANO §3, `LineCard`). |

---

## 3. Mapa das 11 telas obrigatórias → plano

`ctx` §1. Status: ✅ existe (mockup+plano) · ⚠️ parcial · ❌ a desenhar.

| # | Tela (`ctx`) | Rota front | Página React | Dono | Status | Ação de alinhamento |
|---|--------------|-----------|--------------|------|--------|---------------------|
| 1 | `login.html` | `/login` | `auth/Login` | Guilherme | ✅ | — |
| 2 | `cadastro.html` | `/cadastro` | `auth/Cadastro` | Guilherme | ✅ | Tipo de usuário **não** no cadastro público (`ctx` §1.1) — já é o default `comum`. |
| 3 | `recupera_senha.html` | `/recupera-senha` | `auth/RecuperaSenha` | Guilherme | ❌ | **Nova obrigatória** (era pendência #3). Solicitar por e-mail + redefinir. |
| 4 | `dashboard.html` | `/admin` | `admin/Dashboard` | Helena | ⚠️ | Faltam indicadores de **frota** (trens ativos/manutenção/parados, velocidade média, alertas críticos) — pendência #4. Ocultar dado restrito por perfil. |
| 5 | `trens.html` | `/admin/trens` | `admin/Trens` | Yasmin | ❌ | Dado modelado (`trem`). Lista + status + filtro por status. |
| 6 | `sensores.html` | `/admin/sensores` | `admin/Sensores` | Yasmin | ❌ | Lista + tipo/localização/**segmento**/última leitura + filtro por tipo + excluir (com `ConfirmModal` + regra de integridade). `segmento` = aberto (§9 O2). |
| 7 | `rotas.html` | `/admin/rotas` | `admin/Rotas` | Helena | ⚠️ | Renomear de "Linhas"/`/admin/linhas` → "Rotas" (L1). Falta trajeto/horários + acompanhamento de **viagens programadas** (§9 O3). |
| 8 | `usuarios.html` | `/admin/usuarios` | `admin/Usuarios` | Rafael | ✅ | Renomear de "Funcionários"/`/admin/funcionarios` → "Usuários" (L1). Lista + adicionar/editar/desativar. Visível a admin/gerente. |
| 9 | `notificacoes_alertas.html` | `/admin/notificacoes` | `admin/NotificacoesAlertas` | Helena | ⚠️ | `alerta` existe; **+** `notificacoes` (L2). Filtro severidade/tipo, destaque pra crítico. |
| 10 | `gera_relatorio.html` | `/admin/relatorios/gerar` | `admin/GeraRelatorio` | Yasmin | ❌ | Seleção de tipo (desempenho/energia/eficiência/manutenção) + período + filtros → cria `relatorio`. |
| 11 | `visualiza_relatorio.html` | `/admin/relatorios/:id` | `admin/VisualizaRelatorio` | Yasmin | ❌ | Modelo comum: filtros + tabela + gráfico + exportar/imprimir. |

**Renomeações de rota que isto força (L1):** `/admin/linhas` → `/admin/rotas`; `/admin/funcionarios*` → `/admin/usuarios*`. Afeta Helena e Rafael (§9 O4).

---

## 4. Telas opcionais (`ctx` §2) → status

| Opcional (`ctx`) | No plano? | Nota |
|------------------|-----------|------|
| Perfil do usuário | ✅ | `cliente/Perfil` + `PerfilEdicao` (Rafael). |
| Compra de passagens | ❌ | Fora de escopo do plano atual; não obrigatória. |
| Viagens (itinerários) | ⚠️ | `ctx` permite destacar de Rotas. Ligado ao §9 O3 (modelar `viagem`). |
| Cadastro de estações/rotas | ⚠️ | Parcial — não há entidade `estacao`. Adiar com O3. |
| Visualização em mapa | ⚠️ | Mockups de Rotas mostram mapa; sem dado geoespacial modelado. Opcional. |

---

## 5. Perfis (`ctx` §3) ↔ `cargo.nivel_acesso`

| Perfil (`ctx`) | `cargo.nivel_acesso` | Acesso |
|----------------|----------------------|--------|
| Usuário comum | `cliente` (cargo `comum`, default) | Info pública + próprio perfil; sem dado restrito do painel. |
| Maquinista | `operacional` | Viagem própria, sensores em tempo real do trem operado, **criar alertas**. |
| Administrador / Gerente | `gestao` | Tudo: painel completo, usuários, trens, sensores, rotas, relatórios. |

Compatível com o PLANO §5. Ponto de atenção: o `ctx` dá ao **maquinista** o poder de *criar alerta* — garantir que o guard de `/admin/alertas` (ou a ação dentro de notificacoes_alertas) aceite `operacional`, não só `gestao`.

---

## 6. Vocabulário canônico (`ctx` §5)

| Termo `ctx` / UI | Tabela (banco) | Label UI | Não usar |
|------------------|----------------|----------|----------|
| rotas | `linha` | "Rotas" | ~~linhas~~ (na UI) |
| usuários | `usuario` | "Usuários" | ~~funcionários~~ |
| trens | `trem` | "Trens" | ~~frota~~ (quando é a entidade) |
| viagem / itinerário | *(sem tabela ainda)* | "Viagem" | — |

"frota" segue válido como **métrica agregada** no dashboard (velocidade média da frota), não como nome da entidade.

---

## 7. Diretrizes de design (`ctx` §4) → onde encostam

| Diretriz `ctx` | Onde no projeto |
|----------------|-----------------|
| §4.1 Cor semântica de status (verde/amarelo/vermelho, fixa) | L6/L7. Adicionar **tokens de status** em `styles/tokens.css` (resolve pendência #2). |
| §4.2 Marca como acento, 60-30-10 | Guia de estilo é marrom/bege; aplicar proporção 60 neutro / 30 secundária / 10 marca. Registrar na doc de tokens quando montar. |
| §4.3 Mobile-first; listas → tabela no desktop, cards no mobile | Já no PLANO (critérios §6, `responsividade.md`). |
| §4.4 Aproveitar largura no desktop | Critério "pronto" desktop 1440px (PLANO §6). |
| §4.5 Dados fictícios realistas (`TR-204`, `S-TEMP-001`) | `db/seed.sql` + qualquer mock de tela. Nada de `AAA`/`LOGO`. |
| §4.6 Revisão ortográfica + duas versões (mobile+desktop) | Critério "pronto" + resolve pendência #8 (typos do mockup: "Matutenção", "local de patida"…). |

---

## 8. Deltas de banco propostos (NÃO aplicados — você é o dono do modelo)

Registrados pra implementar na entrega de banco, não nesta rodada. Forma a confirmar (§9).

- **`notificacoes`** (nova, L2): notificação dirigida ao usuário, distinta do `alerta` (que é sobre uma `linha`). Proposta: `id`, `usuario_id` FK→`usuario`, `tipo`, `severidade` ENUM(`normal`,`alerta`,`falha`)? ou (`info`,`atencao`,`critico`), `mensagem`, `lida` BOOLEAN, `criado_em`. Relação com `alerta` a definir (notificação *gerada por* um alerta vs. independente).
- **`sensor.segmento`** (O2): `ctx` §1.3 pede "segmento". Hoje `sensor` tem `localizacao`/`tipo_dado`. Adicionar coluna `segmento` **ou** derivar de `localizacao`.
- **Rotas/viagens** (O3): `linha` não tem trajeto/horários. `ctx` §1.3/§5 quer viagens programadas na tela de rotas, mas **adia o ajuste de itinerário "pra momento posterior"**. Modelar `viagem` (trem, trajeto, horário, status) quando a tela amadurecer.

---

## 9. Decisões abertas (por isso o doc é BRAINSTORMING, não LOCKED)

- [ ] **O1** — Forma exata de `notificacoes` (campos, FK, relação com `alerta`). Dono: Guilherme (modelo) + Helena (consome na tela).
- [ ] **O2** — `sensor.segmento`: coluna nova ou derivar de `localizacao`?
- [ ] **O3** — `viagem`/itinerário: modelar agora ou adiar (como o próprio `ctx` adia)? Define o quanto a tela de Rotas entrega na 1ª versão.
- [ ] **O4** — Confirmar renomes de rota `/admin/linhas`→`/admin/rotas` e `/admin/funcionarios`→`/admin/usuarios` com Helena e Rafael (quebra links/imports já escritos? hoje não há front, então custo ~zero — confirmar mesmo assim).

Resolver O1–O4 com o grupo → travar (flip pra LOCKED) → cada dono executa o módulo via `/tdd`.

---

## 10. Próximas ações por dono

- **Guilherme** — `recupera_senha` (nova); tokens de status (L6); decidir O1/O2/O3 no modelo.
- **Helena** — renomear Linhas→Rotas (L1); indicadores de frota no Dashboard; `notificacoes_alertas` consumindo `alerta`+`notificacoes`.
- **Rafael** — renomear Funcionários→Usuários (L1); manter lista/cadastro/editar/desativar.
- **Yasmin** — desenhar+construir `trens`, `sensores` (com `segmento`), `gera_relatorio` + `visualiza_relatorio`.

Fundação compartilhada (tokens + componentes-base, PLANO passo 1–2) antes de cada um seguir pro módulo.
