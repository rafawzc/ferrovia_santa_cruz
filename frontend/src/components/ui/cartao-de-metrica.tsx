import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { SeloDeStatus, type Status } from '@/components/ui/selo-de-status'

interface CartaoDeMetricaProps {
  icon: LucideIcon
  label: string
  value: ReactNode
  status?: Status
}

export function CartaoDeMetrica({ icon: Icon, label, value, status }: CartaoDeMetricaProps) {
  return (
    <Card className="flex-row items-center gap-4 p-4">
      <span className="flex size-12 shrink-0 items-center justify-center rounded-sm bg-marca text-marca-foreground">
        <Icon className="size-6" aria-hidden />
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-rotulo leading-snug font-semibold tracking-wide text-muted-foreground uppercase">
            {label}
          </p>
          {status && <SeloDeStatus status={status} className="shrink-0" />}
        </div>
        <p className="text-destaque leading-none font-bold tabular-nums">{value}</p>
      </div>
    </Card>
  )
}
