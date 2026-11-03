import { skipToken, useQuery } from '@tanstack/react-query'
import { api, type FiltroRelatorio } from '@/lib/api'

export function useRelatorio(filtro: FiltroRelatorio | null) {
  return useQuery({
    queryKey: ['relatorios', filtro],
    queryFn: filtro === null ? skipToken : () => api.relatorios.gerar(filtro),
  })
}
