import { X, CheckCircle, Clock, MapPin, Train } from 'lucide-react'
import Button from '../Button/Button'

export default function MaintenanceDetail({ maintenance, onClose, onFinalize }) {
  if (!maintenance) return null

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-overlay">
      <div className="mx-4 w-full max-w-md rounded-3xl bg-primary p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-primary-foreground">Detalhes da Manutenção</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-primary-foreground transition-opacity hover:opacity-70"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl bg-secondary p-5">
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Train size={18} className="text-primary-foreground" />
                <p className="text-base font-semibold text-primary-foreground">
                  {maintenance.linha}
                </p>
              </div>
              <span
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  maintenance.statusFinalizacao === 'finalizada'
                    ? 'bg-success/20 text-success'
                    : 'bg-destructive/20 text-destructive'
                }`}
              >
                {maintenance.statusFinalizacao === 'finalizada' ? 'Finalizada' : 'Pendente'}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-foreground/50" />
                <p className="text-sm text-foreground">Motivo: {maintenance.motivo}</p>
              </div>
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-foreground/60" />
                <p className="text-sm text-foreground">Setor: {maintenance.setor}</p>
              </div>
              <div className="flex items-center gap-2">
                <Clock size={14} className="text-foreground/60" />
                <p className="text-xs text-foreground/70">
                  Cadastrada em: {new Date(maintenance.timestamp).toLocaleString('pt-BR')}
                </p>
              </div>
            </div>

            {maintenance.statusFinalizacao !== 'finalizada' && (
              <div className="mt-2 flex justify-center">
                <Button
                  onClick={() => onFinalize(maintenance.id)}
                  className="w-full bg-success px-8 hover:bg-success/90"
                >
                  <CheckCircle size={20} className="mr-2" />
                  Finalizar Manutenção
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
