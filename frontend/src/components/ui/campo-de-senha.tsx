import { useState, type ComponentProps } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export function CampoDeSenha({ className, ...props }: Omit<ComponentProps<typeof Input>, 'type'>) {
  const [senhaVisivel, setSenhaVisivel] = useState(false)
  return (
    <div className="relative">
      <Input
        type={senhaVisivel ? 'text' : 'password'}
        className={cn('pr-12', className)}
        {...props}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="absolute top-1/2 right-2 -translate-y-1/2 text-muted-foreground"
        aria-label={senhaVisivel ? 'Ocultar senha' : 'Mostrar senha'}
        aria-pressed={senhaVisivel}
        onClick={() => {
          setSenhaVisivel((senhaVisivel) => !senhaVisivel)
        }}
      >
        {senhaVisivel ? <EyeOff /> : <Eye />}
      </Button>
    </div>
  )
}
