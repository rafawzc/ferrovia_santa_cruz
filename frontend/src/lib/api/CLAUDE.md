# lib/api/ — único lugar que chama fetch

- `client.ts`: `requisitar<T>(method, path, body?)` — prefixa `/api`, `credentials: 'same-origin'` (o cookie `sessao` HttpOnly vai sozinho; o front nunca lê token), JSON na ida e na volta, `204` → `undefined`. Resposta não-ok → `ApiError(status, body)`; corpo que não é JSON (ex: `502` do proxy com o backend fora) vira `body: null`.
- `tratouErrosDeCampo(erro, formulario)` (em `client.ts`): `422` do FastAPI → `setError('Valor inválido')` em cada `loc[1]` que existe nos valores do form; devolve `true` se era 422 (a página dá `return`). Único lugar dessa tradução.
- `types.ts`: espelho de `docs/backend/api.md`. Mudou o contrato → muda aqui na mesma tacada. `LinhaStatus` é subconjunto do `Status` do `SeloDeStatus`, então passa direto.
- `index.ts`: o objeto `api.<recurso>.<ação>` + reexport de tipos e `ApiError`. Endpoint novo = uma linha aqui + hook em `src/hooks/<recurso>.ts`.
- IDs viram path com `String(id)` (o lint type-aware barra número cru em template).
- Nada de estado aqui: 401, cache e retry moram no `src/lib/cliente-de-consultas.ts`.
- `comFiltro` (em `index.ts`) monta a query string e descarta `undefined` e `''`; filtro novo é só um campo no tipo `Filtro*` de `types.ts`. Os filtros de `GET /api/usuarios` (`busca`, `papel`, `ativo`) e `GET /api/viagens` seguem esse caminho.
- `api.relatorios.enderecoCsv(filtro)` devolve a **URL** (`/api/relatorios/csv?...`), não faz `fetch`: o download é um `<a download>` e o navegador manda o cookie.
- Campos que a API devolve `null` por papel (`Dashboard.trens_por_status`, `alertas_ativos_por_severidade`, `sensores_criticos`, `velocidade_media`) são `| null` em `types.ts`; a tela trata `null` como "não se aplica", não como zero.
