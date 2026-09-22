import { createContext, useContext, type ReactNode } from 'react'
import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { api, ApiError, type Credenciais, type Usuario } from '@/lib/api'
import { chaveMe } from '@/lib/query-client'

interface AuthContextValue {
  usuario: Usuario | null
  carregando: boolean
  login: UseMutationResult<Usuario, Error, Credenciais>
  logout: UseMutationResult<undefined, Error, void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function buscarMe() {
  try {
    return await api.auth.me()
  } catch (erro) {
    if (erro instanceof ApiError && erro.status === 401) return null
    throw erro
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()
  const me = useQuery({ queryKey: chaveMe, queryFn: buscarMe })

  const login = useMutation({
    mutationFn: api.auth.login,
    onSuccess: (usuario) => {
      queryClient.setQueryData(chaveMe, usuario)
    },
  })

  const logout = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: () => {
      queryClient.setQueryData(chaveMe, null)
      queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== chaveMe[0] })
    },
  })

  return (
    <AuthContext.Provider
      value={{ usuario: me.data ?? null, carregando: me.isPending, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return context
}
