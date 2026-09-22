import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { chaveMe } from '@/lib/query-client'

export function useCadastro() {
  return useMutation({ mutationFn: api.auth.cadastro })
}

export function useRecuperarSenha() {
  return useMutation({ mutationFn: api.auth.recuperarSenha })
}

export function useAtualizarPerfil() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: api.auth.atualizarMe,
    onSuccess: (usuario) => {
      queryClient.setQueryData(chaveMe, usuario)
    },
  })
}
