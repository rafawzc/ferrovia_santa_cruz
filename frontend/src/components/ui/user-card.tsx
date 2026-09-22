import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

interface UserCardProps {
  nome: string
  cargo: string
  ativo: boolean
  foto?: string
  onClick?: () => void
}

export function UserCard({ nome, cargo, ativo, foto, onClick }: UserCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-center gap-1 rounded-xl bg-primary p-4 text-center text-primary-foreground transition-colors hover:bg-primary/90"
    >
      <Avatar className="mb-2 size-20 rounded-lg">
        {foto && <AvatarImage src={foto} alt="" className="object-cover" />}
        <AvatarFallback className="rounded-lg bg-secondary text-2xl font-bold text-secondary-foreground">
          {nome.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="text-sm font-semibold">{nome}</span>
      <span className="text-xs">{cargo}</span>
      <span className="flex items-center gap-1.5 text-xs">
        <span className={cn('size-2 rounded-full', ativo ? 'bg-success' : 'bg-danger')} />
        {ativo ? 'Ativo' : 'Inativo'}
      </span>
    </button>
  )
}
