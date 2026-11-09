import { AlertTriangle, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ApiError } from '@/lib/api'

export function mensagemDeErro(error: Error) {
  return error instanceof ApiError ? error.message : 'Sem conexão com o servidor'
}

export function ErroDeCarregamento({
  error,
  aoTentarDeNovo,
}: {
  error: Error
  aoTentarDeNovo?: () => void
}) {
  return (
    <Card role="alert" className="items-center gap-3 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-danger text-danger-foreground">
        <AlertTriangle className="size-6" aria-hidden />
      </span>
      <p className="text-xl leading-tight font-semibold">Não foi possível carregar</p>
      <p className="text-corpo text-muted-foreground">{mensagemDeErro(error)}</p>
      <Button
        variant="outline"
        className="mt-2"
        onClick={() => {
          if (aoTentarDeNovo) {
            aoTentarDeNovo()
            return
          }
          window.location.reload()
        }}
      >
        <RotateCcw aria-hidden />
        Tentar de novo
      </Button>
    </Card>
  )
}
