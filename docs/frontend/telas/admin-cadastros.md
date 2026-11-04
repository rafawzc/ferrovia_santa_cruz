# Telas admin de cadastro — Carga e Usuários

Fase 4 (reescrita em TSX sobre o design system + API real). Contrato: [`../../backend/api.md`](../../backend/api.md).

## `/admin/carga` — Monitoramento de Carga

Arquivo: `frontend/src/pages/admin/CargaLista.tsx`. Quem: `operacional`, `gestao`.

- **Lista** (`useCargas` → `GET /api/cargas`, mais recente primeiro): tabela. No celular mostra só Carga, Peso e Destino (igual ao mockup `mobile/carga-lista-tabela.png`); a partir de `md` aparecem Partida, Vagão e Trem; a partir de `lg`, a data do cadastro.
- **Cadastro**: botão "Cadastrar" no cabeçalho abre um `Dialog` com o formulário (em vez de rota própria, como no mockup `carga-cadastro.png`: menos código, mesmo resultado). `useCriarCarga` → `POST /api/cargas`; sucesso fecha o modal, mostra toast e a lista recarrega sozinha.
- **Campos**: tipo, peso (aceita vírgula: `10,5`), partida, destino (texto livre, como no banco), vagão e nº do trem (opcionais). As regras do zod copiam as do backend (tamanhos, `0 < peso < 10000`).
- **Trem**: não existe `GET /api/trens`, então o trem é digitado pelo número (id). Id inexistente → `409` → mensagem "Trem não encontrado" no campo. Vira `Select` quando o endpoint de trens existir.
- **Removido (L28)**: ocupação de vagões, limite por vagão, mapa de poltronas e toda a aba Passageiros. O banco não tem capacidade de vagão nem passageiro. Voltam quando houver tabela + endpoint.
- **Data**: `criado_em` vem sem fuso, em UTC. A tela formata com `dataHora()` de `src/lib/utils.ts`, que soma `Z` antes do `new Date()`; sem isso o horário sai 3 h adiantado.

## `/admin/usuarios` — Usuários

Arquivo: `frontend/src/pages/admin/UsuariosLista.tsx`. Quem: só `gestao`. Rótulo "Usuários" (Guia L1); o mockup ainda diz "Funcionários".

- **Busca e filtros** (`GET /api/usuarios?busca=&papel=&ativo=`, enviados à API a cada mudança): campo "Buscar por nome ou e-mail", nível de acesso (Cliente, Operacional, Gestão) e situação (Todos, Ativos, Inativos). Sem nenhum filtro a lista inclui inativos.
- **Lista** (`useUsuarios`): no celular/tablet, grade de `CartaoDeUsuario` (`ListaDeCards`, 2–3 colunas, como no mockup); no desktop (`lg`), `TabelaDeUsuarios` com nome, e-mail, telefone, cargo e status (Ativo/Inativo em `Badge`). Os dois saem do `ConteudoDeUsuarios`, que centraliza carregando/erro/vazio ("Nenhum usuário encontrado.").
- **Uma página só**: detalhe, edição e cadastro abrem no mesmo `Dialog` sobre a lista, montado pelo `FormularioDeUsuario` (campos via `CampoTexto`) + `AcaoSenhaTemporaria` + `AcoesDeAtivacao`. As rotas `/admin/usuarios/:id` e `/admin/usuarios/:id/editar` **saíram** do `Aplicacao.tsx`.
- **Cadastro** (`useCriarUsuario` → `POST /api/usuarios`): nome, e-mail, telefone (opcional), cargo (`Select` de `useCargos`), senha (8+).
- **Edição** (`useAtualizarUsuario(id)` → `PATCH /api/usuarios/{id}`): mesmos campos; senha em branco = mantém a atual. Telefone em branco não apaga o telefone (limitação do contrato: `null` = não mexe).
- **Senha temporária** (só ao abrir um usuário existente): "Gerar senha temporária" pede confirmação, chama `POST /api/usuarios/{id}/senha-temporaria` e mostra a senha **uma única vez** num `Dialog`, com botão "Copiar senha". Fechar o `Dialog` descarta a senha. É a forma de recuperar acesso (decisão E3).
- **Desativar** (`useDesativarUsuario` → `DELETE`, que é soft delete): botão com `AlertDialog` de confirmação. Quando o usuário aberto é você mesmo, o botão dá lugar ao texto "Você não pode desativar a própria conta." (a API também recusa, `403`).
- **Reativar**: usuário inativo mostra "Reativar usuário" → `PATCH { ativo: true }`.
- **Trava do último administrador**: desativar ou trocar o cargo do único administrador ativo volta `409` "O sistema precisa de pelo menos um administrador ativo" ([regra](../../backend/api.md#trava-do-último-administrador)). A tela distingue os três `409` possíveis: `"Registro duplicado"` marca o campo e-mail, `"Referência inexistente"` marca o campo cargo, e qualquer outro — o da trava — vira toast com a mensagem que a API mandou, para o motivo chegar ao usuário em vez de virar um erro de cargo.
- **Erros**: `409 "Registro duplicado"` → "E-mail já cadastrado" no campo e-mail; `409 "Referência inexistente"` → "Cargo não encontrado" no campo cargo; outro `409` → toast com a mensagem da API; `422` → "Valor inválido" no campo do `loc` (`tratouErrosDeCampo` de `@/lib/api`); resto → toast com `mensagemDeErro`.
- **Rótulo do cargo**: a API manda o slug (`auxiliar_maquinista`). O mapa slug → rótulo ("Auxiliar de Maquinista") mora em `src/lib/rotulos.ts` (`rotuloDeCargo`), também usado pela barra "Conectado como…"; slug desconhecido aparece cru.
- **Foto**: só `foto_url` de leitura (sem upload na API). Sem foto, o `CartaoDeUsuario` mostra a inicial.
