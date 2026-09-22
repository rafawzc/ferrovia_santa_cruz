# Tela Perfil (`/perfil`)

Página: `frontend/src/pages/Perfil.tsx`. Rota logada, **qualquer papel** (é o início do `cliente`). Referência visual: `docs/design/desktop/usuarios-editar-edicao.png` (a variante com o dock em "Perfil"). Não existe mockup mobile; o layout é uma coluna só (`max-w-2xl`), igual nos dois tamanhos.

## O que mostra

- Cabeçalho "Perfil" com o `ThemeToggle` no canto.
- Foto (`foto_url`) num `Avatar` grande; sem foto → iniciais do nome.
- Formulário único (sem modo leitura separado, como no mockup): **Nome, Email, Telefone, Nova senha**. O campo **Senha atual** só aparece quando o usuário digita uma nova senha.
- Botão **Salvar** (desligado enquanto nada mudou ou salvando) e **Sair da conta** (`Button variant="destructive"`).

## Dados

| O quê | De onde |
|---|---|
| Usuário logado | `useAuth().usuario` (cache `['me']`) |
| Salvar | `useAtualizarPerfil()` → `PATCH /api/auth/me` |
| Sair | `useAuth().logout` → `POST /api/auth/logout`; o guard manda pro `/login` |

O `PATCH` recebe **só os campos alterados** (`dirtyFields` do react-hook-form). `senha_atual` vai junto só quando vem `senha`. Telefone apagado vai como `""`.

Depois do sucesso o hook grava a resposta direto em `['me']` (`setQueryData`), então o resto do app (dock, etc.) já vê o dado novo; a tela reseta o form com essa resposta (limpa as senhas) e mostra toast "Perfil atualizado".

## Validação e erros

Front (zod) espelha o contrato: nome 1–120, email válido até 160, telefone até 20, nova senha 8–128 ou vazia, senha atual obrigatória se tem nova senha.

| API | Onde aparece |
|---|---|
| `400` "Senha atual incorreta" | no campo Senha atual |
| `409` | no campo Email: "Esse email já está em uso" |
| `422` | "Valor inválido" no campo do `loc` |
| outro / rede | toast de erro |

## Fora da tela

- **Foto**: não dá pra trocar — o `PATCH /api/auth/me` proíbe `foto_url` (422) e não há upload. Só exibe.
- **Cargo**: o mockup do perfil não mostra; ficou fora.
