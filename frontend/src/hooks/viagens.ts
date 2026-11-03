import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type FiltroViagens, type ViagemEdicao } from '@/lib/api'

const chaveViagens = ['viagens'] as const

function useInvalidarViagens() {
  const clienteDeConsultas = useQueryClient()
  return () => clienteDeConsultas.invalidateQueries({ queryKey: chaveViagens })
}

export function useViagens(filtro: FiltroViagens = {}) {
  return useQuery({
    queryKey: [...chaveViagens, filtro],
    queryFn: () => api.viagens.listar(filtro),
  })
}

export function useCriarViagem() {
  const invalidar = useInvalidarViagens()
  return useMutation({ mutationFn: api.viagens.criar, onSuccess: invalidar })
}

export function useAtualizarViagem(id: number) {
  const invalidar = useInvalidarViagens()
  return useMutation({
    mutationFn: (viagem: ViagemEdicao) => api.viagens.atualizar(id, viagem),
    onSuccess: invalidar,
  })
}

export function useExcluirViagem() {
  const invalidar = useInvalidarViagens()
  return useMutation({ mutationFn: api.viagens.excluir, onSuccess: invalidar })
}
