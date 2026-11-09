import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface CabecalhoDeTelaProps {
  title: string
  apoio?: string
  temVoltar?: boolean
  actions?: ReactNode
}

export function CabecalhoDeTela({
  title,
  apoio,
  temVoltar = false,
  actions,
}: CabecalhoDeTelaProps) {
  const navigate = useNavigate()
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
      <div className="flex min-w-0 items-start gap-2">
        {temVoltar && (
          <Button
            variant="ghost"
            size="icon"
            className="-ml-2 shrink-0"
            aria-label="Voltar"
            onClick={() => {
              void navigate(-1)
            }}
          >
            <ArrowLeft className="size-5" aria-hidden />
          </Button>
        )}
        <div className="min-w-0">
          <h1 className="text-titulo leading-tight font-bold text-balance lg:text-destaque">
            {title}
          </h1>
          {apoio && <p className="mt-2 text-corpo text-muted-foreground">{apoio}</p>}
        </div>
      </div>
      {actions && (
        <div className="flex shrink-0 flex-col gap-2 *:w-full sm:flex-row sm:items-center sm:*:w-auto">
          {actions}
        </div>
      )}
    </header>
  )
}
