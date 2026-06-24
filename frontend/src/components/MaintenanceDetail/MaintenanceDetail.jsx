import { X, CheckCircle, Clock, MapPin, Train } from 'lucide-react'
import Button from '../Button/Button'

export default function MaintenanceDetail({ maintenance, onClose, onFinalize }) {
  if (!maintenance) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50">
      <div className="bg-componente1 rounded-3xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-texto2">Detalhes da Manutenção</h2>
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
              <div className="flex items-center gap-2">
                <Train size={18} className="text-texto1" />
                <p className="text-base font-semibold text-texto1">{maintenance.linha}</p>
              </div>
              <span
                className={`text-xs font-medium px-3 py-1 rounded-full ${
                  maintenance.statusFinalizacao === 'finalizada'
                    ? 'bg-success/20 text-success'
                    : 'bg-error/20 text-error'
                }`}
              >
                {maintenance.statusFinalizacao === 'finalizada' ? 'Finalizada' : 'Pendente'}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-texto1/50" />
                <p className="text-sm text-texto1">Motivo: {maintenance.motivo}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-texto1/50" />
                <p className="text-sm text-texto1">Setor: {maintenance.setor}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-texto1/50" />
                <p className="text-xs text-texto1/70">
                  Cadastrada em: {new Date(maintenance.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>
          </div>

          {maintenance.statusFinalizacao !== 'finalizada' && (
            <div className="flex justify-center mt-2">
              <Button
                onClick={() => onFinalize(maintenance.id)}
                className="w-full px-8 bg-success hover:bg-success/90"
              >
                <CheckCircle size={20} className="mr-2" />
                Finalizar Manutenção
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
