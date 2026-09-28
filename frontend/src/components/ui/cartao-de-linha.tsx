import { Card } from '@/components/ui/card'
import { SeloDeStatus } from '@/components/ui/selo-de-status'
import type { LinhaStatus } from '@/lib/api'

interface CartaoDeLinhaProps {
  numero: string
  status: LinhaStatus
  ativo: boolean
}

export function CartaoDeLinha({ numero, status, ativo }: CartaoDeLinhaProps) {
  return (
    <Card className="items-center gap-2 bg-secondary p-5 text-center text-secondary-foreground">
      <p className="text-lg">
        Rota <span className="font-bold">{numero}</span>
      </p>
      <SeloDeStatus status={status} />
      <p className="text-sm text-muted-foreground">{ativo ? 'Ativo' : 'Inativo'}</p>
    </Card>
  )
}
