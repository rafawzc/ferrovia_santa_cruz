import type { ReactNode } from 'react'

const CLASSE_DE_ROTULO = 'text-rotulo font-semibold tracking-wide text-muted-foreground uppercase'

interface RotuloDeDadoProps {
  children: ReactNode
  como?: 'p' | 'dt'
}

export function RotuloDeDado({ children, como = 'p' }: RotuloDeDadoProps) {
  if (como === 'dt') return <dt className={CLASSE_DE_ROTULO}>{children}</dt>
  return <p className={CLASSE_DE_ROTULO}>{children}</p>
}

interface DadoProps {
  rotulo: string
  valor: string | number
}

export function Dado({ rotulo, valor }: DadoProps) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <RotuloDeDado como="dt">{rotulo}</RotuloDeDado>
      <dd className="text-right tabular-nums">{valor}</dd>
    </div>
  )
}
