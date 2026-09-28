import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const STATUS = {
  normal: { dot: 'bg-success', label: 'Normal' },
  alerta: { dot: 'bg-warning', label: 'Atenção' },
  falha: { dot: 'bg-danger', label: 'Crítico' },
} as const

interface CartaoDeMetricaProps {
  icon: LucideIcon
  label: string
  value: ReactNode
  status?: keyof typeof STATUS
}

export function CartaoDeMetrica({ icon: Icon, label, value, status }: CartaoDeMetricaProps) {
  return (
    <Card className="flex-row items-center gap-4 bg-accent p-4 text-accent-foreground">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      {status && (
        <span className={cn('size-3 shrink-0 rounded-full', STATUS[status].dot)}>
          <span className="sr-only">{STATUS[status].label}</span>
        </span>
      )}
    </Card>
  )
}
