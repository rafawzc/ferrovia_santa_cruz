# Dados, sessão e rotas do front

Fase 4, item D1 (2026-09-22). Contrato da API: [`../backend/api.md`](../backend/api.md).

## Como uma tela busca dado

```
página ──► hook (src/hooks/<recurso>.ts, TanStack Query) ──► api.<recurso> (src/lib/api) ──► fetch('/api/...') ──► proxy do Vite ──► backend
```

- O TanStack Query guarda o resultado em cache (por chave, ex: `['cargas']`), dá `isPending`/`error` pronto pra tela e, quando uma mutação dá certo (ex: cadastrar carga), invalida a chave e a lista recarrega sozinha.
- Só `src/lib/api/` chama `fetch` (regra de lint). Erro da API vira `ApiError` com `status` e o `detail` do backend.
- Sessão = cookie `sessao` HttpOnly. O front não guarda token: pergunta `GET /api/auth/me` no boot. Qualquer `401` no meio do uso derruba a sessão no front e o guard manda pro login.

## Hooks

| Módulo | Hooks | Endpoint |
|---|---|---|
| `contexts/AuthContext.tsx` | `useAuth()` → `usuario`, `carregando`, `login`, `logout` | `GET /api/auth/me`, `POST /api/auth/login`, `POST /api/auth/logout` |
| `hooks/auth.ts` | `useCadastro`, `useRecuperarSenha`, `useAtualizarPerfil` | `POST /api/auth/cadastro`, `POST /api/auth/recuperar-senha`, `PATCH /api/auth/me` |
| `hooks/usuarios.ts` | `useUsuarios`, `useUsuario(id)`, `useCriarUsuario`, `useAtualizarUsuario(id)`, `useDesativarUsuario` | `/api/usuarios` |
| `hooks/cargos.ts` | `useCargos` | `GET /api/cargos` |
| `hooks/linhas.ts` | `useLinhas` | `GET /api/linhas` |
| `hooks/cargas.ts` | `useCargas`, `useCriarCarga` | `/api/cargas` |
| `hooks/alertas.ts` | `useAlertas`, `useCriarAlerta` | `/api/alertas` |
| `hooks/dashboard.ts` | `useDashboard` | `GET /api/dashboard` |

## Rotas e acesso

Papel vem da API (`cliente` < `operacional` < `gestao`). Sem sessão → `/login` (a URL pedida é guardada e reaberta depois do login). Papel errado → início do papel (`cliente` → `/perfil`, `operacional`/`gestao` → `/admin`). Logado abrindo `/login` → vai pro início.

| Rota | Tela (arquivo) | Quem |
|---|---|---|
| `/` | redireciona pra `/login` | — |
| `/login` | `pages/auth/Login.tsx` | público (deslogado) |
| `/cadastro` | `pages/auth/Cadastro.tsx` | público (deslogado) |
| `/recuperar-senha` | `pages/auth/RecuperarSenha.tsx` | público (deslogado) |
| `/admin` | `pages/admin/Dashboard.tsx` | operacional, gestao |
| `/admin/rotas` | `pages/admin/Rotas.tsx` | operacional, gestao |
| `/admin/carga` | `pages/admin/CargaLista.tsx` (cadastro em `Dialog`) | operacional, gestao |
| `/admin/alertas` | `pages/admin/Alertas.tsx` | operacional, gestao |
| `/admin/usuarios` | `pages/admin/UsuariosLista.tsx` (detalhe, edição e cadastro em `Dialog`) | gestao |
| `/perfil` | `pages/Perfil.tsx` | qualquer logado |
| `/ui` | `pages/Vitrine.tsx` (vitrine do design system) | público |
| qualquer outra | redireciona pra `/` | — |

Renomes do Guia (L1) aplicados: `/admin/linhas` → `/admin/rotas`, `/admin/funcionarios*` → `/admin/usuarios`. Não há rota própria pra formulário: `/admin/usuarios/:id`, `/admin/usuarios/:id/editar` e os `…/cadastro` viraram `Dialog` dentro da lista. O dock do `PageShell` mostra só os itens do papel (cliente vê só Perfil). Cada tela é um pedaço de JS separado (`React.lazy`), baixado quando a rota abre.

Todas as telas são TSX sobre o design system e os hooks acima (fase 4 concluída). O que cada tela mostra, o que saiu do mockup e por quê: [`telas/`](telas/).
