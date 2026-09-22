import { Card } from '@/components/ui/card'
import { StatusBadge, type Status } from '@/components/ui/status-badge'

interface LineCardProps {
  numero: string
  status: Status
  ativo: boolean
}

export function LineCard({ numero, status, ativo }: LineCardProps) {
  return (
    <Card className="items-center gap-2 bg-secondary p-5 text-center text-secondary-foreground">
      <p className="text-lg">
        Rota <span className="font-bold">{numero}</span>
      </p>
      <StatusBadge status={status} />
      <p className="text-sm text-muted-foreground">{ativo ? 'Ativo' : 'Inativo'}</p>
    </Card>
  )
}
