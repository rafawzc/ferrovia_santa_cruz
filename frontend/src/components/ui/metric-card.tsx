import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TONE = {
  success: { dot: 'bg-success', label: 'Normal' },
  warning: { dot: 'bg-warning', label: 'Atenção' },
  danger: { dot: 'bg-danger', label: 'Crítico' },
} as const

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: ReactNode
  tone?: keyof typeof TONE
}

export function MetricCard({ icon: Icon, label, value, tone }: MetricCardProps) {
  return (
    <Card className="flex-row items-center gap-4 bg-accent p-4 text-accent-foreground">
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Icon className="size-6" aria-hidden />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
      {tone && (
        <span className={cn('size-3 shrink-0 rounded-full', TONE[tone].dot)}>
          <span className="sr-only">{TONE[tone].label}</span>
        </span>
      )}
    </Card>
  )
}
