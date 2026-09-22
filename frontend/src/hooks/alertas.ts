import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const chave = ['alertas'] as const

export function useAlertas() {
  return useQuery({ queryKey: chave, queryFn: api.alertas.listar })
}

export function useCriarAlerta() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.alertas.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}
