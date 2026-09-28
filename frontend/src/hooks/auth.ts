import { useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { chaveMe } from '@/lib/cliente-de-consultas'

export function useCadastro() {
  return useMutation({ mutationFn: api.autenticacao.cadastro })
}

export function useRecuperarSenha() {
  return useMutation({ mutationFn: api.autenticacao.recuperarSenha })
}

export function useAtualizarPerfil() {
  const clienteDeConsultas = useQueryClient()
  return useMutation({
    mutationFn: api.autenticacao.atualizarMe,
    onSuccess: (usuario) => {
      clienteDeConsultas.setQueryData(chaveMe, usuario)
    },
  })
}
