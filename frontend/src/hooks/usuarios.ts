import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type UsuarioEdicao } from '@/lib/api'
import { chaveMe } from '@/lib/query-client'

const chave = ['usuarios'] as const

function useInvalidarUsuarios() {
  const queryClient = useQueryClient()
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: chave }),
      queryClient.invalidateQueries({ queryKey: chaveMe }),
    ])
}

export function useUsuarios() {
  return useQuery({ queryKey: chave, queryFn: api.usuarios.listar })
}

export function useUsuario(id: number) {
  return useQuery({ queryKey: [...chave, id], queryFn: () => api.usuarios.obter(id) })
}

export function useCriarUsuario() {
  const invalidar = useInvalidarUsuarios()
  return useMutation({ mutationFn: api.usuarios.criar, onSuccess: invalidar })
}

export function useAtualizarUsuario(id: number) {
  const invalidar = useInvalidarUsuarios()
  return useMutation({
    mutationFn: (dados: UsuarioEdicao) => api.usuarios.atualizar(id, dados),
    onSuccess: invalidar,
  })
}

export function useDesativarUsuario() {
  const invalidar = useInvalidarUsuarios()
  return useMutation({ mutationFn: api.usuarios.desativar, onSuccess: invalidar })
}
