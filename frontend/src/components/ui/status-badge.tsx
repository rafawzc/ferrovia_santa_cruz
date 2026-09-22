import { Badge } from '@/components/ui/badge'

const STATUS = {
  normal: { label: 'Normal', variant: 'success' },
  alerta: { label: 'Atenção', variant: 'warning' },
  falha: { label: 'Crítico', variant: 'danger' },
  manutencao: { label: 'Manutenção', variant: 'warning' },
  atraso: { label: 'Atraso', variant: 'delay' },
  fechado: { label: 'Fechado', variant: 'danger' },
  na_estacao: { label: 'Na estação', variant: 'success' },
  ja_partiu: { label: 'Já partiu', variant: 'success' },
} as const

export type Status = keyof typeof STATUS

export const STATUSES = Object.keys(STATUS) as Status[]

export function StatusBadge({ status, className }: { status: Status; className?: string }) {
  const { label, variant } = STATUS[status]
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
