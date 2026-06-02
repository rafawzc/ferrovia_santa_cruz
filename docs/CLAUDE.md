# docs/ — Índice

Este arquivo é o **mapa da pasta `docs/`**. Quem chega aqui lê isto primeiro e sabe onde tudo está. Regra: **profundidade final de 2** (`docs/<area-geral>/<subtema>/arquivo.md` — nada mais fundo) e **primeira camada com poucas pastas amplas**. Antes de criar pasta nova na raiz do `docs/`, pergunte se não é subtema de uma área que já existe. Spec completa da estrutura no `.claude/CLAUDE.md` (seção *Documentação*).

> **Mantenha este índice atualizado na mesma tacada** em que criar/remover/renomear uma área geral ou mudar o que ela contém. Índice desatualizado é pior que índice nenhum.

## Áreas gerais (camada 1)

| Área | O que tem dentro |
|------|------------------|
| [`arquitetura/`](arquitetura/) | Como o sistema é montado. `containers-e-rede.md`: modelo Docker dos 3 serviços, rede interna, proxy do frontend, `depends_on` em cadeia. |
| [`backend/`](backend/) | API FastAPI e acesso a dados. `acesso-a-dados.md`: SQL puro, queries parametrizadas, conexão, padrões anti-injection. |
| [`frontend/`](frontend/) | UI React. `responsividade.md`: mobile-first, padrões responsivos, consumo de API por caminho relativo, os dois lados (admin/cliente). |
| [`decisoes/`](decisoes/) | Registro das decisões técnicas com o *porquê*. `stack.md`: FastAPI, SQL puro (e a razão política), Vite/Vitest, Docker 3-container, estrutura de docs. |

## Convenções

- **Subpastas (camada 2)** entram quando uma área geral cresce e um tema merece vários arquivos (ex: `backend/auth/` com vários `.md`). Até lá, arquivo direto na área geral basta.
- **Atividades da SA**: quando começarem a entrar, criar uma área `entregas/` (camada 1) com uma subpasta ou arquivo por atividade.
- Datas sempre em absoluto. Decisões nunca são apagadas — são marcadas como superadas (ver `decisoes/stack.md`).
