export default function UserCard({ nome, cargo, status, foto, onClick }) {
  const isActive = status === 'Ativo'

  return (
    <button
      onClick={onClick}
      className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-2xl bg-primary p-4 transition-opacity hover:opacity-90"
    >
      <div className="h-20 w-20 overflow-hidden rounded-xl bg-surface">
        {foto ? (
          <img src={foto} alt={nome} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-on-primary">
            {nome?.charAt(0)}
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-on-primary">{nome}</p>
        <p className="text-xs text-on-primary/80">{cargo}</p>
        <p className={`mt-0.5 text-xs font-medium ${isActive ? 'text-green-300' : 'text-red-300'}`}>
          {status}
        </p>
      </div>
    </button>
  )
}
