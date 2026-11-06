import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type FiltroTrens, type TremEdicao } from '@/lib/api'

const chaveTrens = ['trens'] as const

function useInvalidarTrens() {
  const clienteDeConsultas = useQueryClient()
  return () => clienteDeConsultas.invalidateQueries({ queryKey: chaveTrens })
}

export function useTrens(filtro: FiltroTrens = {}) {
  return useQuery({
    queryKey: [...chaveTrens, filtro],
    queryFn: () => api.trens.listar(filtro),
  })
}

export function useCriarTrem() {
  const invalidar = useInvalidarTrens()
  return useMutation({ mutationFn: api.trens.criar, onSuccess: invalidar })
}

export function useAtualizarTrem(id: number) {
  const invalidar = useInvalidarTrens()
  return useMutation({
    mutationFn: (trem: TremEdicao) => api.trens.atualizar(id, trem),
    onSuccess: invalidar,
  })
}

export function useExcluirTrem() {
  const invalidar = useInvalidarTrens()
  return useMutation({ mutationFn: api.trens.excluir, onSuccess: invalidar })
}
