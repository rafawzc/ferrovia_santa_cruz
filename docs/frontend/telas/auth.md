# Telas de autenticação — Login, Cadastro, Recuperar senha

Páginas em `frontend/src/pages/autenticacao/*.tsx`, dentro do `LayoutPublico` (`src/Aplicacao.tsx`): quem já tem sessão nunca vê essas telas, é mandado pro início do papel. Layout = `LayoutDeAutenticacao` (logo + cartão no mobile, coluna de 45% + foto no desktop, conteúdo em `max-w-md`). Formulários com react-hook-form + zod + `Field`; senha com `CampoDeSenha`. Recompostas em 2026-11-09 sob [`../principios-de-ui.md`](../principios-de-ui.md).

Comum às três desde o refactor:

- **O alternador de tema é do `LayoutPublico`**, não das páginas: uma pílula flutuante no canto superior direito (`nao-imprime`), presente nas três telas deslogadas. Nas telas logadas ele vive na casca.
- **Títulos em frase, não em Caixa Alta De Cada Palavra**: "Entrar na conta", "Criar conta", "Recuperar senha".
- **Erro da requisição aparece como faixa no topo do formulário** (`role="alert"`, fundo `destructive`), não como texto perdido no meio dos campos. Erro de campo continua sob o campo.
- O link de troca de tela é um parágrafo centrado no fim ("Já tem uma conta? Entrar"), em `text-rotulo`, com o link em `foreground` sublinhado no hover — não é mais um botão.

## `/login` — `Login.tsx`

- Campos: e-mail, senha (+ link "Esqueceu sua senha?" sob o campo). Botão "Entrar" (`size="lg"`, ícone `LogIn`).
- Envia `useAutenticacao().entrar.mutate({ email, senha })` → `POST /api/auth/login`.
- **Não navega.** O `entrar` grava `['me']`; o `LayoutPublico` vê o usuário e redireciona (`state.de` ou `cliente → /viagens`, resto → `/admin`).
- Erros (na faixa do topo): `401` → "E-mail ou senha incorretos" (a API não diz qual dos dois errou); `403` → "Usuário desativado. Fale com a gestão."; outro → "Não foi possível entrar. Tente de novo."

## `/cadastro` — `Cadastro.tsx`

- Campos: nome, e-mail, senha, confirmar senha, aceite dos termos (obrigatório, `Switch`). Botão "Criar conta" (ícone `UserPlus`).
- A descrição do layout diz a consequência: "O cadastro cria uma conta de cliente, com acesso às viagens da ferrovia." **Sem cargo**: o cadastro público sempre cria `cliente` (`cargo: "comum"`, default do banco — Guia §1.1).
- Validação no front espelha o contrato: nome 1–120, e-mail até 160, senha 8–128. "Confirmar senha" e "termos" são só do front — só `nome/email/senha` vão pra API.
- Envia `useCadastro()` → `POST /api/auth/cadastro`.
- **Sucesso → toast "Conta criada…" + navega pra `/login`.** Escolha: a API não loga no cadastro (sem cookie), então o fluxo segue o contrato Cadastro → Sucesso → Login em vez de encadear um login automático.
- `409` → erro no campo e-mail ("Este e-mail já está cadastrado"). `422` → marca "Valor inválido" no campo do `loc`. Outro → toast de erro.
- O erro do aceite dos termos fica dentro de um `FieldContent` ao lado do switch, para não empurrar o rótulo.

## `/recuperar-senha` — `RecuperarSenha.tsx`

- Campo: só e-mail (o endpoint só recebe e-mail). Botão "Enviar instruções" (ícone `Send`).
- Envia `useRecuperarSenha()` → `POST /api/auth/recuperar-senha`.
- A API responde `202` com a mesma mensagem exista o e-mail ou não (sem enumeração de usuário). No sucesso a tela troca o formulário por um bloco `role="status"` centrado: ícone de envelope em círculo `success`, título "Verifique seu e-mail" e a mesma mensagem neutra fixa ("Se o e-mail estiver cadastrado, as instruções serão enviadas."). É **stub** no backend: nenhum e-mail sai.
- Falha de envio → faixa de erro no topo ("Não foi possível enviar agora. Tente de novo.").

## O que saiu do mockup (e por quê)

| Item do design | Tela | Motivo |
|---|---|---|
| Toggle "Permitir acesso a localização" | login, cadastro | Nada consome nem guarda — sem coluna/endpoint (L28). |
| Toggle "Aceito os termos" | login | Aceite é do cadastro; no login não significa nada. |
| Login Google / tela de boas-vindas | — | Sem suporte no backend. |
| "Nova senha" + "confirmar" na recuperação (tela legada) | recuperar | A API não redefine senha, só recebe o e-mail. |
