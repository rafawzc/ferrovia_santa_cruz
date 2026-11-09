import { Badge } from '@/components/ui/badge'
import type { ViagemStatus } from '@/lib/api'

const STATUS = {
  normal: { label: 'Normal', variant: 'success' },
  alerta: { label: 'Atenção', variant: 'warning' },
  falha: { label: 'Crítico', variant: 'danger' },
  manutencao: { label: 'Manutenção', variant: 'warning' },
  atraso: { label: 'Atraso', variant: 'delay' },
  fechado: { label: 'Fechado', variant: 'danger' },
  na_estacao: { label: 'Na estação', variant: 'success' },
  ja_partiu: { label: 'Já partiu', variant: 'success' },
  atencao: { label: 'Atenção', variant: 'warning' },
  critico: { label: 'Crítico', variant: 'danger' },
  ativo: { label: 'Ativo', variant: 'success' },
  inativo: { label: 'Inativo', variant: 'secondary' },
  parado: { label: 'Parado', variant: 'danger' },
  programada: { label: 'Programada', variant: 'default' },
  em_andamento: { label: 'Em andamento', variant: 'success' },
  concluida: { label: 'Concluída', variant: 'secondary' },
  cancelada: { label: 'Cancelada', variant: 'danger' },
  atrasada: { label: 'Atrasada', variant: 'delay' },
} as const

export type Status = keyof typeof STATUS

export const STATUSES = Object.keys(STATUS) as Status[]

export const STATUS_DE_VIAGEM = [
  'programada',
  'em_andamento',
  'atrasada',
  'concluida',
  'cancelada',
] as const satisfies readonly ViagemStatus[]

export const rotuloDeStatus = (status: Status) => STATUS[status].label

export const opcoesDeStatus = (statuses: readonly Status[]) =>
  statuses.map((status) => ({ valor: status, rotulo: STATUS[status].label }))

export function SeloDeStatus({ status, className }: { status: Status; className?: string }) {
  const { label, variant } = STATUS[status]
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  )
}
