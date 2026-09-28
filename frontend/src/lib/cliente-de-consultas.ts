import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'

export const chaveMe = ['me'] as const

function aoErro(erro: Error) {
  const sessaoExpirou = erro instanceof ApiError && erro.status === 401
  if (sessaoExpirou) clienteDeConsultas.setQueryData(chaveMe, null)
}

export const clienteDeConsultas = new QueryClient({
  queryCache: new QueryCache({ onError: aoErro }),
  mutationCache: new MutationCache({ onError: aoErro }),
  defaultOptions: {
    queries: { retry: (falhas, erro) => !(erro instanceof ApiError) && falhas < 3 },
  },
})
