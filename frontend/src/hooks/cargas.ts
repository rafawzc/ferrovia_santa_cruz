import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const chave = ['cargas'] as const

export function useCargas() {
  return useQuery({ queryKey: chave, queryFn: api.cargas.listar })
}

export function useCriarCarga() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.cargas.criar,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: chave }),
  })
}
