export default function UserCard({ nome, cargo, status, foto, onClick }) {
  const isActive = status === 'Ativo'

  return (
    <button
      onClick={onClick}
      className="bg-componente1 rounded-2xl p-4 flex flex-col items-center gap-2 cursor-pointer hover:opacity-90 transition-opacity w-full"
    >
      <div className="w-20 h-20 rounded-xl overflow-hidden bg-componente3">
        {foto ? (
          <img src={foto} alt={nome} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-texto2 text-2xl font-bold">
            {nome?.charAt(0)}
          </div>
        )}
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-texto2">{nome}</p>
        <p className="text-xs text-texto2/80">{cargo}</p>
        <p className={`text-xs font-medium mt-0.5 ${isActive ? 'text-green-300' : 'text-red-300'}`}>
          {status}
        </p>
      </div>
    </button>
  )
}
