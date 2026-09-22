export default function UserCard({ nome, cargo, status, foto, onClick }) {
  const isActive = status === 'Ativo'

  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer items-center gap-3 rounded-xl bg-componente1 px-3 py-2.5 transition-colors hover:bg-componente1/90"
    >
      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-componente3">
        {foto ? (
          <img src={foto} alt={nome} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-texto1">
            {nome?.charAt(0)}
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1 text-left">
        <p className="truncate text-xs font-semibold text-texto1">{nome}</p>
        <p className="truncate text-[10px] text-texto1/70">{cargo}</p>
      </div>
      <div className="flex shrink-0 items-center">
        <div className={`h-2 w-2 rounded-full ${isActive ? 'bg-success' : 'bg-error'}`} />
      </div>
    </button>
  )
}
