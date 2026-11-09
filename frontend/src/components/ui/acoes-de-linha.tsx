import { Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'

interface AcoesDeLinhaProps {
  nome: string
  aoEditar: () => void
  aoExcluir: () => void
}

export function AcoesDeLinha({ nome, aoEditar, aoExcluir }: AcoesDeLinhaProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Editar ${nome}`} onClick={aoEditar}>
            <Pencil aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Editar</TooltipContent>
      </Tooltip>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" aria-label={`Excluir ${nome}`} onClick={aoExcluir}>
            <Trash2 aria-hidden />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Excluir</TooltipContent>
      </Tooltip>
    </div>
  )
}
