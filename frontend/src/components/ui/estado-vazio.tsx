import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Card } from '@/components/ui/card'

interface EstadoVazioProps {
  icone: LucideIcon
  titulo: string
  descricao?: string
  acao?: ReactNode
}

export function EstadoVazio({ icone: Icone, titulo, descricao, acao }: EstadoVazioProps) {
  return (
    <Card className="items-center gap-3 px-6 text-center">
      <span className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Icone className="size-6" aria-hidden />
      </span>
      <p className="text-xl leading-tight font-semibold">{titulo}</p>
      {descricao && <p className="text-corpo text-balance text-muted-foreground">{descricao}</p>}
      {acao && <div className="mt-2">{acao}</div>}
    </Card>
  )
}
