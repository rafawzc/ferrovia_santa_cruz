# Telas admin-b — Carga e Usuários

Fase 4 (reescrita em TSX sobre o design system + API real). Contrato: [`../../backend/api.md`](../../backend/api.md).

## `/admin/carga` — Monitoramento de Carga

Arquivo: `frontend/src/pages/admin/CargaLista.tsx`. Quem: `operacional`, `gestao`.

- **Lista** (`useCargas` → `GET /api/cargas`, mais recente primeiro): tabela. No celular mostra só Carga, Peso e Destino (igual ao mockup `mobile/carga-lista-tabela.png`); a partir de `md` aparecem Partida, Vagão e Trem; a partir de `lg`, a data do cadastro.
- **Cadastro**: botão "Cadastrar" no cabeçalho abre um `Dialog` com o formulário (em vez de rota própria, como no mockup `carga-cadastro.png`: menos código, mesmo resultado). `useCriarCarga` → `POST /api/cargas`; sucesso fecha o modal, mostra toast e a lista recarrega sozinha.
- **Campos**: tipo, peso (aceita vírgula: `10,5`), partida, destino (texto livre, como no banco), vagão e nº do trem (opcionais). As regras do zod copiam as do backend (tamanhos, `0 < peso < 10000`).
- **Trem**: não existe `GET /api/trens`, então o trem é digitado pelo número (id). Id inexistente → `409` → mensagem "Trem não encontrado" no campo. Vira `Select` quando o endpoint de trens existir.
- **Removido (L28)**: ocupação de vagões, limite por vagão, mapa de poltronas e toda a aba Passageiros. O banco não tem capacidade de vagão nem passageiro. Voltam quando houver tabela + endpoint.
- **Data**: `criado_em` vem sem fuso, em UTC. A tela soma `Z` antes do `new Date()`; sem isso o horário sai 3 h adiantado.

## `/admin/usuarios` — Usuários

Arquivo: `frontend/src/pages/admin/UsuariosLista.tsx`. Quem: só `gestao`. Rótulo "Usuários" (Guia L1); o mockup ainda diz "Funcionários".

- **Lista** (`useUsuarios`, inclui inativos): no celular/tablet, grade de `UserCard` (2–3 colunas, como no mockup); no desktop (`lg`), tabela com nome, e-mail, telefone, cargo e status (Ativo/Inativo em `Badge`).
- **Uma página só**: detalhe, edição e cadastro abrem no mesmo `Dialog` sobre a lista (como o `FuncionarioModal` legado). As rotas `/admin/usuarios/:id` e `/admin/usuarios/:id/editar` **saíram** do `App.tsx`.
- **Cadastro** (`useCriarUsuario` → `POST /api/usuarios`): nome, e-mail, telefone (opcional), cargo (`Select` de `useCargos`), senha (8+).
- **Edição** (`useAtualizarUsuario(id)` → `PATCH /api/usuarios/{id}`): mesmos campos; senha em branco = mantém a atual. Telefone em branco não apaga o telefone (limitação do contrato: `null` = não mexe).
- **Desativar** (`useDesativarUsuario` → `DELETE`, que é soft delete): botão com `AlertDialog` de confirmação. Escondido quando o usuário aberto é você mesmo, pra ninguém se trancar pra fora.
- **Reativar**: usuário inativo mostra "Reativar usuário" → `PATCH { ativo: true }`.
- **Erros**: `409 "Registro duplicado"` → "E-mail já cadastrado" no campo e-mail; outro `409` (cargo inexistente) → no campo cargo; `422` → "Valor inválido" no campo do `loc`; resto → toast.
- **Rótulo do cargo**: a API manda o slug (`auxiliar_maquinista`). O mapa slug → rótulo ("Auxiliar de Maquinista") mora na própria página; slug desconhecido aparece cru.
- **Foto**: só `foto_url` de leitura (sem upload na API). Sem foto, o `UserCard` mostra a inicial.
