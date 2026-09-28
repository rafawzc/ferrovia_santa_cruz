import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api, type UsuarioEdicao } from '@/lib/api'
import { chaveMe } from '@/lib/cliente-de-consultas'

const chaveUsuarios = ['usuarios'] as const

function useInvalidarUsuariosEMe() {
  const clienteDeConsultas = useQueryClient()
  return () =>
    Promise.all([
      clienteDeConsultas.invalidateQueries({ queryKey: chaveUsuarios }),
      clienteDeConsultas.invalidateQueries({ queryKey: chaveMe }),
    ])
}

export function useUsuarios() {
  return useQuery({ queryKey: chaveUsuarios, queryFn: api.usuarios.listar })
}

export function useCriarUsuario() {
  const invalidar = useInvalidarUsuariosEMe()
  return useMutation({ mutationFn: api.usuarios.criar, onSuccess: invalidar })
}

export function useAtualizarUsuario(id: number) {
  const invalidar = useInvalidarUsuariosEMe()
  return useMutation({
    mutationFn: (usuario: UsuarioEdicao) => api.usuarios.atualizar(id, usuario),
    onSuccess: invalidar,
  })
}

export function useDesativarUsuario() {
  const invalidar = useInvalidarUsuariosEMe()
  return useMutation({ mutationFn: api.usuarios.desativar, onSuccess: invalidar })
}
