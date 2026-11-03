import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type FiltroAlertas } from '@/lib/api'

const chaveAlertas = ['alertas'] as const

function useInvalidarAlertas() {
  const clienteDeConsultas = useQueryClient()
  return () =>
    Promise.all([
      clienteDeConsultas.invalidateQueries({ queryKey: chaveAlertas }),
      clienteDeConsultas.invalidateQueries({ queryKey: ['dashboard'] }),
    ])
}

export function useAlertas(filtro: FiltroAlertas = {}) {
  return useQuery({
    queryKey: [...chaveAlertas, filtro],
    queryFn: () => api.alertas.listar(filtro),
  })
}

export function useCriarAlerta() {
  const invalidar = useInvalidarAlertas()
  return useMutation({ mutationFn: api.alertas.criar, onSuccess: invalidar })
}

export function useTratarAlerta() {
  const invalidar = useInvalidarAlertas()
  return useMutation({
    mutationFn: ({ id, tratado }: { id: number; tratado: boolean }) =>
      api.alertas.tratar(id, tratado),
    onSuccess: invalidar,
  })
}
