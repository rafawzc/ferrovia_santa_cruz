import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'

const chaveAlertas = ['alertas'] as const

export function useAlertas() {
  return useQuery({ queryKey: chaveAlertas, queryFn: api.alertas.listar })
}

export function useCriarAlerta() {
  const clienteDeConsultas = useQueryClient()
  return useMutation({
    mutationFn: api.alertas.criar,
    onSuccess: () => clienteDeConsultas.invalidateQueries({ queryKey: chaveAlertas }),
  })
}
