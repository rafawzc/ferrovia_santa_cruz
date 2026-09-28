import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface CabecalhoDeTelaProps {
  title: string
  temVoltar?: boolean
  actions?: ReactNode
}

export function CabecalhoDeTela({ title, temVoltar = false, actions }: CabecalhoDeTelaProps) {
  const navigate = useNavigate()
  return (
    <header className="mb-6 flex items-center gap-3">
      {temVoltar && (
        <Button
          variant="ghost"
          size="icon"
          aria-label="Voltar"
          onClick={() => {
            void navigate(-1)
          }}
        >
          <ArrowLeft className="size-6" />
        </Button>
      )}
      <h1 className="flex-1 text-xl font-bold text-foreground lg:text-2xl">{title}</h1>
      {actions}
    </header>
  )
}
