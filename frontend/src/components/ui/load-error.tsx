import { ApiError } from '@/lib/api'

export function mensagemDeErro(error: Error) {
  return error instanceof ApiError ? error.message : 'Sem conexão com o servidor'
}

export function LoadError({ error }: { error: Error }) {
  return (
    <p role="alert" className="text-sm text-destructive">
      Não foi possível carregar: {mensagemDeErro(error)}
    </p>
  )
}
