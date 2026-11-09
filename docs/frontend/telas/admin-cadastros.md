# Telas admin de cadastro — Carga e Usuários

Escritas na fase 4 (TSX sobre o design system + API real) e **recompostas em 2026-11-09** sob [`../principios-de-ui.md`](../principios-de-ui.md) — dados, rotas e contrato não mudaram. Contrato: [`../../backend/api.md`](../../backend/api.md).

## `/admin/carga` — Monitoramento de Carga

Arquivo: `frontend/src/pages/admin/CargaLista.tsx`. Quem: `operacional`, `gestao`. Apoio do cabeçalho: "Cargas registradas, da mais recente para a mais antiga."

- **Lista** (`useCargas` → `GET /api/cargas`, mais recente primeiro): **cartões abaixo de `lg`, tabela a partir de `lg`**. O corte é `lg` (e não `md`, como nas outras telas) porque são sete colunas — Carga, Peso, Partida, Destino, Vagão, Trem e Cadastro — e em tablet elas não caberiam sem rolagem lateral. A versão em cartões mostra tipo e peso na linha de cima e Partida/Destino/Vagão/Trem numa `dl` de duas colunas, com a data do cadastro no pé; a tabela mostra tudo. Nenhuma coluna é escondida por breakpoint: as duas versões dizem a mesma coisa.
- **Cadastro**: botão "Cadastrar carga" nas ações do cabeçalho abre um `Dialog` com o formulário (em vez de rota própria, como no mockup `carga-cadastro.png`: menos código, mesmo resultado). `useCriarCarga` → `POST /api/cargas`; sucesso fecha o modal, mostra toast e a lista recarrega sozinha. O rodapé do diálogo é "Cancelar" + "Cadastrar carga" (vira "Cadastrando…" enquanto envia).
- **Campos**: tipo, peso (aceita vírgula: `10,5`, com `inputMode="decimal"`), partida, destino (texto livre, como no banco), vagão e nº do trem (opcionais, `inputMode="numeric"`). As regras do zod copiam as do backend (tamanhos, `0 < peso < 10000`).
- **Trem**: não existe `GET /api/trens` filtrado por número, então o trem é digitado pelo id. Id inexistente → `409` → mensagem "Trem não encontrado" no campo. Vira `Select` quando fizer sentido.
- **Vazio**: "Nenhuma carga cadastrada" com a frase "O histórico de carga começa no primeiro registro." e o botão "Cadastrar carga", que abre o mesmo `Dialog` (o estado do diálogo mora na página justamente para isso).
- **Removido (L28)**: ocupação de vagões, limite por vagão, mapa de poltronas e toda a aba Passageiros. O banco não tem capacidade de vagão nem passageiro. Voltam quando houver tabela + endpoint.
- **Data**: `criado_em` vem sem fuso, em UTC. A tela formata com `dataHora()` de `src/lib/utils.ts`, que soma `Z` antes do `new Date()`; sem isso o horário sai 3 h adiantado.

## `/admin/usuarios` — Usuários

Arquivo: `frontend/src/pages/admin/UsuariosLista.tsx`. Quem: só `gestao`. Rótulo "Usuários" (Guia L1); o mockup ainda diz "Funcionários". Apoio: "Quem entra no sistema e com qual nível de acesso."

- **Busca e filtros** (`GET /api/usuarios?busca=&papel=&ativo=`, enviados à API a cada mudança): campo de busca por nome ou e-mail ocupando duas colunas, nível de acesso (Cliente, Operacional, Gestão) e situação (Todos, Ativos, Inativos). Sem nenhum filtro a lista inclui inativos. Os três controles ficam numa grade `grid-cols-2 md:grid-cols-4`.
- **Lista** (`useUsuarios`): **grade de `CartaoDeUsuario` abaixo de `md`** (2 colunas, 3 no `sm`) e **tabela a partir de `md`** com Nome, E-mail, Telefone (só de `xl` pra cima), Cargo, Status (`SeloDeStatus` `ativo`/`inativo`) e **Ações**. Nome e e-mail truncam com `title`.
- **Edição é por botão de ação, não pelo nome.** Cada linha tem um botão de ícone `ghost` com `aria-label` "Editar {nome}" (o nome deixou de ser link/clique na linha). No celular, o cartão inteiro continua clicável.
- **Uma página só**: detalhe, edição e cadastro abrem no mesmo `Dialog` sobre a lista, montado pelo `FormularioDeUsuario` (campos via `CampoTexto`) + `AcaoSenhaTemporaria` + `AcoesDeAtivacao`. O título do diálogo é o nome da pessoa (ou "Cadastrar usuário") e a descrição traz cargo + selo de situação. As rotas `/admin/usuarios/:id` e `/admin/usuarios/:id/editar` **saíram** do `Aplicacao.tsx`.
- **Dois vazios distintos**, porque são problemas diferentes:

  | Situação | Título | Ação |
  |---|---|---|
  | há filtro/busca aplicado e nada bate | "Nenhum resultado para esta busca" (ícone `SearchX`) | "Limpar filtros" (`outline`) |
  | nenhum filtro e a base está vazia | "Nenhum usuário cadastrado" (ícone `Users`) | "Cadastrar usuário" (`default`) |

- **Carregando**: esqueleto nas duas formas — seis blocos na grade de cartões abaixo de `md`, oito linhas dentro de um `Card` a partir de `md`.
- **Cadastro** (`useCriarUsuario` → `POST /api/usuarios`): nome, e-mail, telefone (opcional), cargo (`Select` de `useCargos`), senha (8+, com a ajuda "Mínimo de 8 caracteres.").
- **Edição** (`useAtualizarUsuario(id)` → `PATCH /api/usuarios/{id}`): mesmos campos; o campo vira "Nova senha" com a ajuda "Deixe em branco para manter a senha atual.". Telefone em branco não apaga o telefone (limitação do contrato: `null` = não mexe).
- **Ações de conta** ficam num bloco separado no fim do diálogo, sob o rótulo "Acesso ao sistema" e uma divisória.
- **Senha temporária** (só ao abrir um usuário existente): "Gerar senha temporária" pede confirmação em `AlertDialog`, chama `POST /api/usuarios/{id}/senha-temporaria` e mostra a senha **uma única vez** num `Dialog`, em bloco monoespaçado selecionável, com botão "Copiar senha". Fechar o `Dialog` descarta a senha. É a forma de recuperar acesso (decisão E3).
- **Desativar** (`useDesativarUsuario` → `DELETE`, que é soft delete): botão `destructive` com `AlertDialog` de confirmação ("Desativar {nome}?", botão "Desativar usuário"), cujo texto explica que não exclui e que dá pra reativar. Quando o usuário aberto é você mesmo, o botão dá lugar ao texto "Você não pode desativar a própria conta." (a API também recusa, `403`).
- **Reativar**: usuário inativo mostra "Reativar usuário" (`variant="success"`) → `PATCH { ativo: true }`.
- **Trava do último administrador**: desativar ou trocar o cargo do único administrador ativo volta `409` "O sistema precisa de pelo menos um administrador ativo" ([regra](../../backend/api.md#trava-do-último-administrador)). A tela distingue os três `409` possíveis: `"Registro duplicado"` marca o campo e-mail, `"Referência inexistente"` marca o campo cargo, e qualquer outro — o da trava — vira toast com a mensagem que a API mandou, para o motivo chegar ao usuário em vez de virar um erro de cargo.
- **Erros**: `409 "Registro duplicado"` → "E-mail já cadastrado" no campo e-mail; `409 "Referência inexistente"` → "Cargo não encontrado" no campo cargo; outro `409` → toast com a mensagem da API; `422` → "Valor inválido" no campo do `loc` (`tratouErrosDeCampo` de `@/lib/api`); resto → toast "Não foi possível salvar: …".
- **Rótulo do cargo**: a API manda o slug (`auxiliar_maquinista`). O mapa slug → rótulo ("Auxiliar de Maquinista") mora em `src/lib/rotulos.ts` (`rotuloDeCargo`), também usado pelo rodapé da casca e pela tela de Perfil; slug desconhecido aparece cru.
- **Foto**: só `foto_url` de leitura (sem upload na API). Sem foto, o `CartaoDeUsuario` mostra a inicial.
