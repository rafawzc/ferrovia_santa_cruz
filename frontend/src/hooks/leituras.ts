import { useQuery } from '@tanstack/react-query'
import { api, type FiltroLeituras } from '@/lib/api'

export function useLeituras(filtro: FiltroLeituras = {}) {
  return useQuery({
    queryKey: ['leituras', filtro],
    queryFn: () => api.leituras.listar(filtro),
  })
}
