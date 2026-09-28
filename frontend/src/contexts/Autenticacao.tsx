import { createContext, useContext, type ReactNode } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { api, ApiError, type Credenciais, type Usuario } from '@/lib/api'
import { chaveMe } from '@/lib/cliente-de-consultas'

interface ValorDaAutenticacao {
  usuario: Usuario | null
  carregando: boolean
  entrar: UseMutationResult<Usuario, Error, Credenciais>
  sair: UseMutationResult<undefined, Error, void>
}

const ContextoDeAutenticacao = createContext<ValorDaAutenticacao | null>(null)

async function buscarMe() {
  try {
    return await api.autenticacao.me()
  } catch (erro) {
    const semSessao = erro instanceof ApiError && erro.status === 401
    if (semSessao) return null
    throw erro
  }
}

export function ProvedorDeAutenticacao({ children }: { children: ReactNode }) {
  const clienteDeConsultas = useQueryClient()
  const me = useQuery({ queryKey: chaveMe, queryFn: buscarMe })

  const entrar = useMutation({
    mutationFn: api.autenticacao.login,
    onSuccess: (usuario) => {
      clienteDeConsultas.setQueryData(chaveMe, usuario)
    },
  })

  const sair = useMutation({
    mutationFn: api.autenticacao.logout,
    onSuccess: () => {
      clienteDeConsultas.setQueryData(chaveMe, null)
      clienteDeConsultas.removeQueries({ predicate: (q) => q.queryKey[0] !== chaveMe[0] })
    },
  })

  return (
    <ContextoDeAutenticacao.Provider
      value={{ usuario: me.data ?? null, carregando: me.isPending, entrar, sair }}
    >
      {children}
    </ContextoDeAutenticacao.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAutenticacao() {
  const contexto = useContext(ContextoDeAutenticacao)
  if (!contexto) {
    throw new Error('useAutenticacao deve ser usado dentro de um ProvedorDeAutenticacao')
  }
  return contexto
}
