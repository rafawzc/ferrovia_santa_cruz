# Dados, sessão e rotas do front

Fase 4, item D1 (2026-09-22); rotas e hooks atualizados em 2026-11-03. Contrato da API: [`../backend/api.md`](../backend/api.md).

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
| `contexts/Autenticacao.tsx` | `useAutenticacao()` → `usuario`, `carregando`, `entrar`, `sair` | `GET /api/auth/me`, `POST /api/auth/login`, `POST /api/auth/logout` |
| `hooks/auth.ts` | `useCadastro`, `useRecuperarSenha`, `useAtualizarPerfil` | `POST /api/auth/cadastro`, `POST /api/auth/recuperar-senha`, `PATCH /api/auth/me` |
| `hooks/usuarios.ts` | `useUsuarios(filtro)` (`busca`, `papel`, `ativo`), `useCriarUsuario`, `useAtualizarUsuario(id)`, `useDesativarUsuario`, `useSenhaTemporaria` | `/api/usuarios`, `POST /api/usuarios/{id}/senha-temporaria` |
| `hooks/cargos.ts` | `useCargos` | `GET /api/cargos` |
| `hooks/linhas.ts` | `useLinhas`, `useCriarLinha`, `useAtualizarLinha(id)`, `useExcluirLinha` | `/api/linhas` |
| `hooks/trens.ts` | `useTrens(filtro)` (`busca`, `status`), `useCriarTrem`, `useAtualizarTrem(id)`, `useExcluirTrem` | `/api/trens` |
| `hooks/sensores.ts` | `useSensores(filtro)` (`tipo`, `trem_id`), `useCriarSensor`, `useAtualizarSensor(id)`, `useExcluirSensor` | `/api/sensores` |
| `hooks/viagens.ts` | `useViagens(filtro)` (`status`, `trem_id`, `linha_id`, `data`), `useCriarViagem`, `useAtualizarViagem(id)`, `useExcluirViagem` | `/api/viagens` |
| `hooks/cargas.ts` | `useCargas`, `useCriarCarga` | `/api/cargas` |
| `hooks/alertas.ts` | `useAlertas(filtro)`, `useCriarAlerta`, `useTratarAlerta` | `/api/alertas`, `PATCH /api/alertas/{id}` |
| `hooks/dashboard.ts` | `useDashboard` | `GET /api/dashboard` |
| `hooks/relatorios.ts` | `useRelatorio(filtro \| null)` (com `null` a query nem dispara) | `GET /api/relatorios` |
| `hooks/leituras.ts` | `useLeituras(filtro)` (nenhuma tela usa ainda) | `GET /api/leituras` |

Filtros vazios (`''`, `undefined`) não vão pra URL (`comFiltro` em `lib/api/index.ts`). A chave da query inclui o filtro (`['usuarios', filtro]`), então trocar o filtro busca de novo e a invalidação por prefixo (`['usuarios']`) pega todas as variantes.

## Rotas e acesso

Papel vem da API (`cliente` < `operacional` < `gestao`). Sem sessão → `/login` (a URL pedida é guardada e reaberta depois do login). Papel errado → início do papel (`cliente` → `/viagens`, `operacional`/`gestao` → `/admin`). Logado abrindo `/login` → vai pro início. Os grupos de papel moram em `src/Aplicacao.tsx`: `EQUIPE` (operacional, gestao) e `GESTAO`.

| Rota | Tela (arquivo) | Quem | Doc |
|---|---|---|---|
| `/` | redireciona pra `/login` | — | — |
| `/login`, `/cadastro`, `/recuperar-senha` | `pages/autenticacao/*.tsx` | público (deslogado) | [`auth.md`](telas/auth.md) |
| `/admin` | `pages/admin/Dashboard.tsx` | operacional, gestao | [`admin-monitoramento.md`](telas/admin-monitoramento.md) |
| `/admin/trens` | `pages/admin/Trens.tsx` | operacional, gestao (escrita: gestao) | [`admin-frota.md`](telas/admin-frota.md) |
| `/admin/sensores` | `pages/admin/Sensores.tsx` | operacional, gestao (escrita: gestao) | [`admin-frota.md`](telas/admin-frota.md) |
| `/admin/rotas` | `pages/admin/Rotas.tsx` (abas Rotas e Viagens) | operacional, gestao (escrita: gestao) | [`admin-monitoramento.md`](telas/admin-monitoramento.md) |
| `/admin/alertas` | `pages/admin/Alertas.tsx` | operacional, gestao | [`admin-monitoramento.md`](telas/admin-monitoramento.md) |
| `/admin/carga` | `pages/admin/CargaLista.tsx` (cadastro em `Dialog`) | operacional, gestao | [`admin-cadastros.md`](telas/admin-cadastros.md) |
| `/admin/usuarios` | `pages/admin/UsuariosLista.tsx` (detalhe, edição e cadastro em `Dialog`) | gestao | [`admin-cadastros.md`](telas/admin-cadastros.md) |
| `/admin/relatorios` | `pages/admin/Relatorios.tsx` (gerar) | gestao | [`admin-relatorios.md`](telas/admin-relatorios.md) |
| `/admin/relatorios/ver` | `pages/admin/RelatorioVisualizacao.tsx` (visualizar) | gestao | [`admin-relatorios.md`](telas/admin-relatorios.md) |
| `/viagens` | `pages/Viagens.tsx` | qualquer logado (menu só mostra pro `cliente`) | [`viagens.md`](telas/viagens.md) |
| `/perfil` | `pages/Perfil.tsx` | qualquer logado | [`perfil.md`](telas/perfil.md) |
| `/ui` | `pages/Vitrine.tsx` (vitrine do design system) | público | [`design-system.md`](design-system.md) |
| qualquer outra | redireciona pra `/` | — | — |

`/viagens` e `/perfil` ficam no `LayoutProtegido` sem o guard `Papeis`: o `operacional` e a `gestao` que digitarem `/viagens` abrem a tela, mas o item só existe no menu do `cliente`.

Renomes do Guia (L1) aplicados: `/admin/linhas` → `/admin/rotas`, `/admin/funcionarios*` → `/admin/usuarios`. Não há rota própria pra formulário: `/admin/usuarios/:id`, `/admin/usuarios/:id/editar` e os `…/cadastro` viraram `Dialog` dentro da lista. O dock da `CascaDePagina` mostra só os itens do papel (lista `NAV` em `casca-de-pagina.tsx`): equipe vê Início, Trens, Sensores, Rotas, Alertas e Carga; só `gestao` acrescenta Relatórios e Usuários; `cliente` vê Viagens e Perfil; Perfil é de todos. Cada tela é um pedaço de JS separado (`React.lazy`), baixado quando a rota abre.

Todas as telas são TSX sobre o design system e os hooks acima (fase 4 concluída). O que cada tela mostra, o que saiu do mockup e por quê: [`telas/`](telas/).
