# lib/api/ — único lugar que chama fetch

- `client.ts`: `request<T>(method, path, body?)` — prefixa `/api`, `credentials: 'same-origin'` (o cookie `sessao` HttpOnly vai sozinho; o front nunca lê token), JSON na ida e na volta, `204` → `undefined`. Resposta não-ok → `ApiError(status, body)`; corpo que não é JSON (ex: `502` do proxy com o backend fora) vira `body: null`.
- `types.ts`: espelho de `docs/backend/api.md`. Mudou o contrato → muda aqui na mesma tacada. `LinhaStatus` é subconjunto do `Status` do `StatusBadge`, então passa direto.
- `index.ts`: o objeto `api.<recurso>.<ação>` + reexport de tipos e `ApiError`. Endpoint novo = uma linha aqui + hook em `src/hooks/<recurso>.ts`.
- IDs viram path com `String(id)` (o lint type-aware barra número cru em template).
- Nada de estado aqui: 401, cache e retry moram no `src/lib/query-client.ts`.
