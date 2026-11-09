import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { SeloDeStatus } from '@/components/ui/selo-de-status'

interface CartaoDeUsuarioProps {
  nome: string
  cargo: string
  ativo: boolean
  foto?: string
  onClick?: () => void
}

export function CartaoDeUsuario({ nome, cargo, ativo, foto, onClick }: CartaoDeUsuarioProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full flex-col items-center gap-2 rounded-lg bg-marca p-4 text-center text-marca-foreground transition-[background-color,box-shadow,transform] duration-150 ease-out hover:bg-marca/90 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring active:translate-y-0 motion-safe:hover:-translate-y-0.5"
    >
      <Avatar className="mb-1 size-20 rounded-sm">
        {foto && <AvatarImage src={foto} alt="" className="object-cover" />}
        <AvatarFallback className="rounded-sm bg-secondary text-2xl font-bold text-secondary-foreground">
          {nome.charAt(0)}
        </AvatarFallback>
      </Avatar>
      <span className="text-corpo leading-snug font-semibold">{nome}</span>
      <span className="text-rotulo leading-snug">{cargo}</span>
      <SeloDeStatus status={ativo ? 'ativo' : 'inativo'} />
    </button>
  )
}
