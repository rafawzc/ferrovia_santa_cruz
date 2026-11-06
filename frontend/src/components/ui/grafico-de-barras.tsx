import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const barra = cva(
  'h-3 w-full appearance-none overflow-hidden rounded-full bg-muted [&::-webkit-progress-bar]:bg-transparent',
  {
    variants: {
      variant: {
        default: '[&::-moz-progress-bar]:bg-primary [&::-webkit-progress-value]:bg-primary',
        success: '[&::-moz-progress-bar]:bg-success [&::-webkit-progress-value]:bg-success',
        warning: '[&::-moz-progress-bar]:bg-warning [&::-webkit-progress-value]:bg-warning',
        danger: '[&::-moz-progress-bar]:bg-danger [&::-webkit-progress-value]:bg-danger',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)

export type VarianteDeBarra = NonNullable<VariantProps<typeof barra>['variant']>

export interface BarraDeGrafico {
  rotulo: string
  valor: number
  variant?: VarianteDeBarra
}

interface GraficoDeBarrasProps {
  barras: BarraDeGrafico[]
  formatar?: (valor: number) => string
  className?: string
}

export function GraficoDeBarras({ barras, formatar = String, className }: GraficoDeBarrasProps) {
  if (barras.length === 0) {
    return <p className="text-sm text-muted-foreground">Sem dados para o gráfico.</p>
  }

  const maior = Math.max(...barras.map(({ valor }) => valor))
  const escala = maior > 0 ? maior : 1

  return (
    <dl className={cn('flex flex-col gap-3', className)}>
      {barras.map(({ rotulo, valor, variant }) => (
        <div key={rotulo} className="flex flex-col gap-1">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="truncate text-sm font-medium">{rotulo}</dt>
            <dd className="text-sm font-bold tabular-nums">{formatar(valor)}</dd>
          </div>
          <progress
            className={barra({ variant })}
            value={valor}
            max={escala}
            aria-label={`${rotulo}: ${formatar(valor)}`}
          />
        </div>
      ))}
    </dl>
  )
}
