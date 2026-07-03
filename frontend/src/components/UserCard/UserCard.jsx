export default function UserCard({ nome, cargo, status, foto, onClick }) {
  const isActive = status === 'Ativo'

  return (
    <button
      onClick={onClick}
      className="bg-componente1 rounded-xl px-3 py-2.5 flex items-center gap-3 cursor-pointer hover:bg-componente1/90 transition-colors w-full"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden bg-componente3 shrink-0">
        {foto ? (
          <img src={foto} alt={nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-texto1 text-sm font-bold">
            {nome?.charAt(0)}
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0 text-left">
        <p className="text-xs font-semibold text-texto1 truncate">{nome}</p>
        <p className="text-[10px] text-texto1/70 truncate">{cargo}</p>
      </div>
      <div className="flex items-center shrink-0">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-success' : 'bg-error'}`} />
      </div>
    </button>
  )
}
