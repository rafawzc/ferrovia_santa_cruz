# docs/ — Índice

Este arquivo é o **mapa da pasta `docs/`**. Quem chega aqui lê isto primeiro e sabe onde tudo está. Regra: **profundidade final de 2** (`docs/<area-geral>/<subtema>/arquivo.md` — nada mais fundo) e **primeira camada com poucas pastas amplas**. Antes de criar pasta nova na raiz do `docs/`, pergunte se não é subtema de uma área que já existe. Spec completa da estrutura no `.claude/CLAUDE.md` (seção *Documentação*).

> **Mantenha este índice atualizado na mesma tacada** em que criar/remover/renomear uma área geral ou mudar o que ela contém. Índice desatualizado é pior que índice nenhum.

## Arquivos na raiz

| Arquivo | O que é |
|---------|---------|
| [`PLANO_IMPLEMENTACAO.md`](PLANO_IMPLEMENTACAO.md) | **Entrega 2** — plano de implementação (stack, arquitetura de arquivos, componentes reutilizáveis, ordem de construção, fluxos de navegação, critérios de "pronto"). Fica na **raiz** de `docs/` por exigência literal do enunciado (`docs/PLANO_IMPLEMENTACAO.md`) — exceção consciente à regra de profundidade. |

## Áreas gerais (camada 1)

| Área | O que tem dentro |
|------|------------------|
| [`design/`](design/) | **Referência visual base** do projeto (mockup da Entrega 1). `mockup-entrega-1.md`: catálogo de telas com pareamento mobile↔desktop. Subpastas `mobile/`, `desktop/` (telas) e `guia-de-estilo/` (paleta de cores + tipografia/ícones). Abra a imagem da tela antes de implementá-la em React. |
| [`arquitetura/`](arquitetura/) | Como o sistema é montado. `containers-e-rede.md`: modelo Docker dos 3 serviços, rede interna, proxy do frontend, `depends_on` em cadeia. |
| [`banco/`](banco/) | Modelo de dados do MySQL. `modelo-de-dados.md`: ERD, tabelas/tipos/chaves, integridade referencial, regra de exclusão restrita de sensores. Fonte da verdade pro `db/schema.sql`. |
| [`backend/`](backend/) | API FastAPI e acesso a dados. `acesso-a-dados.md`: SQL puro, queries parametrizadas, conexão, padrões anti-injection. |
| [`frontend/`](frontend/) | UI React. `responsividade.md`: mobile-first, padrões responsivos, consumo de API por caminho relativo, os dois lados (admin/cliente). |
| [`decisoes/`](decisoes/) | Registro das decisões técnicas com o *porquê*. `stack.md`: FastAPI, SQL puro (e a razão política), Vite/Vitest, Docker 3-container, estrutura de docs. `uniformizacao-telas-ctx.md`: alinhamento do [`ctx.md`](../ctx.md) (Guia de Uniformização SENAI — 11 telas + vocabulário) contra o `PLANO_IMPLEMENTACAO`; decisões travadas, mapa das telas por dono, deltas de banco abertos. |

## Convenções

- **Subpastas (camada 2)** entram quando uma área geral cresce e um tema merece vários arquivos (ex: `backend/auth/` com vários `.md`). Até lá, arquivo direto na área geral basta.
- **Atividades da SA**: quando começarem a entrar, criar uma área `entregas/` (camada 1) com uma subpasta ou arquivo por atividade.
- Datas sempre em absoluto. Decisões nunca são apagadas — são marcadas como superadas (ver `decisoes/stack.md`).
