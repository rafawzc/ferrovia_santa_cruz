import { Moon, Sun } from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useTema } from '@/contexts/Tema'
import { cn } from '@/lib/utils'

export function AlternadorDeTema({ className }: { className?: string }) {
  const { escuro, alternarTema } = useTema()
  return (
    <div className={cn('flex items-center gap-2 text-foreground', className)}>
      <Sun className="size-4" aria-hidden />
      <Switch checked={escuro} onCheckedChange={alternarTema} aria-label="Tema escuro" />
      <Moon className="size-4" aria-hidden />
    </div>
  )
}
