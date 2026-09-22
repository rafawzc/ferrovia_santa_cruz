import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useCargos() {
  return useQuery({ queryKey: ['cargos'], queryFn: api.cargos.listar })
}
