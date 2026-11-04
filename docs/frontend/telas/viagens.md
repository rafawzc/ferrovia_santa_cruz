# Tela Viagens do usuário comum (`/viagens`)

Página: `frontend/src/pages/Viagens.tsx`. É o **início do `cliente`** (login e guard mandam para cá). Rota logada sem restrição de papel; o item "Viagens" só aparece no menu do `cliente`. Contrato: `GET /api/viagens` em [`../../backend/api.md`](../../backend/api.md#viagens), que aceita o papel `cliente` na leitura (a escrita segue só `gestao`).

- **O que mostra:** todas as viagens do sistema, da mais recente para a mais antiga. Não há filtro "minhas viagens": o banco não liga viagem a usuário, então o cliente vê a malha inteira. Só leitura, sem botões de ação.
- **Filtros** (enviados à API): status (todos, programada, em andamento, atrasada, concluída, cancelada, via `STATUS_DE_VIAGEM`) e dia (`type="date"`, viagens que partem naquele dia).
- **Lista:** o `ListaDeViagens` (`components/ui/lista-de-viagens.tsx`), o mesmo da aba Viagens de `/admin/rotas`, sem a coluna de ações: cartões no celular, tabela a partir de `md`, com rota, trajeto, trem, partida, chegada e `SeloDeStatus`. Horários por `dataHora()` (a API manda UTC sem fuso).
- **Estados:** carregando (`Skeleton`), erro (`ErroDeCarregamento`) e "Nenhuma viagem encontrada.".
