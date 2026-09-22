# Telas de autenticação — Login, Cadastro, Recuperar senha

Páginas em `frontend/src/pages/auth/*.tsx`, dentro do `PublicLayout` (`src/App.tsx`): quem já tem sessão nunca vê essas telas, é mandado pro início do papel. Layout = `AuthLayout` (logo + card no mobile, coluna + foto no desktop). Formulários com react-hook-form + zod + `Field`; senha com `PasswordInput`.

## `/login` — `Login.tsx`

- Campos: e-mail, senha (+ link "Esqueceu sua senha?" e "Criar Conta").
- Envia `useAuth().login.mutate({ email, senha })` → `POST /api/auth/login`.
- **Não navega.** O `login` grava `['me']`; o `PublicLayout` vê o usuário e redireciona (`state.de` ou `cliente → /perfil`, resto → `/admin`).
- Erros (abaixo dos campos): `401` → "E-mail ou senha incorretos" (a API não diz qual dos dois errou); `403` → "Usuário desativado. Fale com a gestão."; outro → mensagem genérica.

## `/cadastro` — `Cadastro.tsx`

- Campos: nome, e-mail, senha, confirmar senha, aceite dos termos (obrigatório). **Sem cargo**: o cadastro público sempre cria `cliente` (`cargo: "comum"`, default do banco — Guia §1.1).
- Validação no front espelha o contrato: nome 1–120, e-mail até 160, senha 8–128. "Confirmar senha" e "termos" são só do front — só `nome/email/senha` vão pra API.
- Envia `useCadastro()` → `POST /api/auth/cadastro`.
- **Sucesso → toast "Conta criada…" + navega pra `/login`.** Escolha: a API não loga no cadastro (sem cookie), então o fluxo segue o contrato Cadastro → Sucesso → Login em vez de encadear um login automático.
- `409` → erro no campo e-mail ("Este e-mail já está cadastrado"). `422` → marca "Valor inválido" no campo do `loc`. Outro → toast de erro.

## `/recuperar-senha` — `RecuperarSenha.tsx`

- Campo: só e-mail (o endpoint só recebe e-mail).
- Envia `useRecuperarSenha()` → `POST /api/auth/recuperar-senha`.
- A API responde `202` com a mesma mensagem exista o e-mail ou não (sem enumeração de usuário). A tela troca o form pela mesma mensagem neutra fixa: "Se o e-mail estiver cadastrado, as instruções serão enviadas." É **stub** no backend: nenhum e-mail sai.

## O que saiu do mockup (e por quê)

| Item do design | Tela | Motivo |
|---|---|---|
| Toggle "Permitir acesso a localização" | login, cadastro | Nada consome nem guarda — sem coluna/endpoint (L28). |
| Toggle "Aceito os termos" | login | Aceite é do cadastro; no login não significa nada. |
| Login Google / tela de boas-vindas | — | Sem suporte no backend. |
| "Nova senha" + "confirmar" na recuperação (tela legada) | recuperar | A API não redefine senha, só recebe o e-mail. |
