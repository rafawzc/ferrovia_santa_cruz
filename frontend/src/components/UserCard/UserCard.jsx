export default function UserCard({ nome, cargo, status, foto, onClick }) {
  const isActive = status === 'Ativo'

  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-primary px-3 py-2.5 transition-colors hover:bg-primary/90"
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-secondary">
        {foto ? (
          <img src={foto} alt={nome} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-foreground">
            {nome?.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-xs font-semibold text-foreground">{nome}</p>
        <p className="truncate text-[10px] text-foreground/70">{cargo}</p>
      </div>
      <div className="flex shrink-0 items-center">
        <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-success' : 'bg-destructive'}`} />
      </div>
    </button>
  )
}
