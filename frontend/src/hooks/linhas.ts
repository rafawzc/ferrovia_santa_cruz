import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/api'

export function useLinhas() {
  return useQuery({ queryKey: ['linhas'], queryFn: api.linhas.listar })
}
