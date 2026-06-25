import { X, Package, MapPin, Clock } from 'lucide-react'

export default function WagonDetail({ wagon, percentage, onClose }) {
  if (!wagon) return null

  const getStatusColor = () => {
    if (percentage >= 90) return 'bg-error'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-success'
  }

  const getStatusText = () => {
    if (percentage >= 90) return 'Lotado'
    if (percentage >= 70) return 'Quase lotado'
    return 'Disponível'
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50">
      <div className="bg-componente1 rounded-3xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-texto2">Detalhes do Vagão {wagon}</h2>
          <button
            onClick={onClose}
            className="text-texto2 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-componente3 rounded-2xl p-5">
            <div className="flex justify-between items-center mb-4">
              <p className="text-base font-semibold text-texto1">Status do Vagão</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-texto1">{getStatusText()}</span>
                <div className={`w-4 h-4 rounded-full ${getStatusColor()}`} />
              </div>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-texto1 mb-1">
                <span>Capacidade</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-3 bg-componente1/30 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getStatusColor()} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Package size={16} className="text-texto1/70" />
                <p className="text-sm text-texto1">Capacidade: {percentage >= 90 ? 'Máxima' : 'Normal'}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-texto1/70" />
                <p className="text-sm text-texto1">Último registro: Hoje</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-texto1/70" />
                <p className="text-sm text-texto1">Atualizado: Agora</p>
              </div>
            </div>
          </div>

          {percentage >= 90 && (
            <div className="bg-error/10 border border-error/30 rounded-2xl p-4">
              <p className="text-sm text-error font-medium">
                ⚠️ Vagão quase no limite. Considere redistribuir a carga.
              </p>
            </div>
          )}

          {percentage >= 70 && percentage < 90 && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4">
              <p className="text-sm text-yellow-600 font-medium">
                ⚡ Vagão com capacidade elevada. Monitorar de perto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
