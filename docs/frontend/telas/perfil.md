# Tela Perfil (`/perfil`)

Página: `frontend/src/pages/Perfil.tsx`. Rota logada, **qualquer papel** (item do grupo "Conta", visível pra todos e presente no dock; o início do `cliente` é [`/viagens`](viagens.md)). Referência visual: `docs/design/desktop/usuarios-editar-edicao.png`. Recomposta em 2026-11-09 sob [`../principios-de-ui.md`](../principios-de-ui.md).

## Composição

Cabeçalho "Perfil" (sem ações — o alternador de tema é da casca, não desta tela) e, abaixo, uma grade `lg:grid-cols-3`:

| Bloco | Onde | O que tem |
|---|---|---|
| **Identidade** | 1 coluna (`h-fit`) | `Avatar` grande (`foto_url` ou as duas iniciais do nome), nome como `h2`, e-mail truncado com `title`, `Badge` com o cargo e o botão **"Sair da conta"** em largura cheia |
| **Dados da conta** | 2 colunas | Nome, Email, Telefone |
| **Senha** | 2 colunas | Nova senha e, só quando se digita uma nova, **Senha atual** |

- No celular os três blocos empilham nessa ordem (identidade primeiro).
- Os dois cartões de formulário são um `<form>` só, com o botão **"Salvar alterações"** no fim (largura cheia no celular, à direita no `sm`; desligado enquanto nada mudou ou enquanto salva, virando "Salvando…").
- "Sair da conta" é **`variant="outline"`**, não `destructive`: sair não destrói nada, e o vermelho ali competia com a ação principal da tela.
- O cartão da senha explica a regra no `CardDescription` ("Deixe em branco para manter a senha atual…") em vez de deixar o usuário descobrir pelo erro.

## Dados

| O quê | De onde |
|---|---|
| Usuário logado | `useAutenticacao().usuario` (cache `['me']`) |
| Salvar | `useAtualizarPerfil()` → `PATCH /api/auth/me` |
| Sair | `useAutenticacao().sair` → `POST /api/auth/logout`; o guard manda pro `/login` |

O `PATCH` recebe **só os campos alterados** — o helper `dadosAlterados(valores, dirtyFields)` monta o payload a partir do `dirtyFields` do react-hook-form. `senha_atual` vai junto só quando vem `senha`. Telefone apagado vai como `""`.

Depois do sucesso o hook grava a resposta direto em `['me']` (`setQueryData`), então o resto do app (rodapé da casca, etc.) já vê o dado novo; a tela reseta o form com essa resposta (limpa as senhas) e mostra toast "Perfil atualizado".

## Validação e erros

Front (zod) espelha o contrato: nome 1–120, email válido até 160, telefone até 20, nova senha 8–128 ou vazia, senha atual obrigatória se tem nova senha.

| API | Onde aparece |
|---|---|
| `400` "Senha atual incorreta" | no campo Senha atual (`aoErrar`) |
| `409` | no campo Email: "Esse email já está em uso" |
| `422` | "Valor inválido" no campo do `loc` |
| outro / rede | toast de erro |

## Fora da tela

- **Foto**: não dá pra trocar — o `PATCH /api/auth/me` proíbe `foto_url` (422) e não há upload. Só exibe.
- **Cargo**: aparece como `Badge` (leitura), não é editável aqui — quem troca cargo é a gestão, em `/admin/usuarios`.
- **Tema**: não tem alternador próprio. O lugar canônico dele nas telas logadas é o rodapé da casca (barra lateral / folha de menu).
