import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type LinhaEdicao, type LinhaStatus } from '@/lib/api'

const chaveLinhas = ['linhas'] as const

function useInvalidarLinhas() {
  const clienteDeConsultas = useQueryClient()
  return () => clienteDeConsultas.invalidateQueries({ queryKey: chaveLinhas })
}

export function useLinhas(status?: LinhaStatus) {
  return useQuery({
    queryKey: [...chaveLinhas, status ?? null],
    queryFn: () => api.linhas.listar(status),
  })
}

export function useCriarLinha() {
  const invalidar = useInvalidarLinhas()
  return useMutation({ mutationFn: api.linhas.criar, onSuccess: invalidar })
}

export function useAtualizarLinha(id: number) {
  const invalidar = useInvalidarLinhas()
  return useMutation({
    mutationFn: (linha: LinhaEdicao) => api.linhas.atualizar(id, linha),
    onSuccess: invalidar,
  })
}

export function useExcluirLinha() {
  const invalidar = useInvalidarLinhas()
  return useMutation({ mutationFn: api.linhas.excluir, onSuccess: invalidar })
}
