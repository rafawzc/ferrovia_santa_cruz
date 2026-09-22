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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-overlay">
      <div className="mx-4 w-full max-w-md rounded-3xl bg-componente1 p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-texto1">Detalhes do Vagão {wagon}</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-texto1 transition-opacity hover:opacity-70"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-componente3 p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-base font-semibold text-texto1">Status do Vagão</p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-texto1">{getStatusText()}</span>
                <div className={`h-4 w-4 rounded-full ${getStatusColor()}`} />
              </div>
            </div>

            <div className="mb-4">
              <div className="mb-1 flex justify-between text-sm text-texto1">
                <span>Capacidade</span>
                <span>{percentage}%</span>
              </div>
              <div className="h-3 overflow-hidden rounded-full bg-componente1/30">
                <div
                  className={`h-full ${getStatusColor()} transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Package size={16} className="text-texto1/70" />
              <p className="text-sm text-texto1">
                Capacidade: {percentage >= 90 ? 'Máxima' : 'Normal'}
              </p>
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

          {percentage >= 90 && (
            <div className="rounded-2xl border border-error/30 bg-error/10 p-4">
              <p className="text-sm font-medium text-error">
                ⚠️ Vagão quase no limite. Considere redistribuir a carga.
              </p>
            </div>
          )}

          {percentage >= 70 && percentage < 90 && (
            <div className="rounded-2xl border border-yellow-500/30 bg-yellow-500/10 p-4">
              <p className="text-sm font-medium text-yellow-600">
                ⚡ Vagão com capacidade elevada. Monitorar de perto.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
