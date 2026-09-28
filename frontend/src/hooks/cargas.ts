import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const chaveCargas = ['cargas'] as const

export function useCargas() {
  return useQuery({ queryKey: chaveCargas, queryFn: api.cargas.listar })
}

export function useCriarCarga() {
  const clienteDeConsultas = useQueryClient()
  return useMutation({
    mutationFn: api.cargas.criar,
    onSuccess: () => clienteDeConsultas.invalidateQueries({ queryKey: chaveCargas }),
  })
}
