import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { ApiError } from '@/lib/api'

export const chaveMe = ['me'] as const

function aoErro(erro: Error) {
  if (erro instanceof ApiError && erro.status === 401) queryClient.setQueryData(chaveMe, null)
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({ onError: aoErro }),
  mutationCache: new MutationCache({ onError: aoErro }),
  defaultOptions: {
    queries: { retry: (falhas, erro) => !(erro instanceof ApiError) && falhas < 3 },
  },
})
