import { useState, useEffect } from 'react'
import {
  BarChart3,
  Wrench,
  Radio,
  Gauge,
  Train,
  AlertTriangle,
  Eye,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import StatusCard from '../../components/StatusCard/StatusCard'
import MaintenanceModal from '../../components/MaintenanceModal/MaintenanceModal'
import MaintenanceDetail from '../../components/MaintenanceDetail/MaintenanceDetail'
import Button from '../../components/Button/Button'
import BottomNav from '../../components/BottomNav/BottomNav'
import logo from '../../assets/logo.svg'

const initialLines = [
  { id: 1, nome: 'Linha 1778', status: 'ok', velocidade: '80 km/h', sensores: 5 },
  { id: 2, nome: 'Linha 2341', status: 'ok', velocidade: '75 km/h', sensores: 4 },
  { id: 3, nome: 'Linha 0912', status: 'error', velocidade: '0 km/h', sensores: 3 },
  { id: 4, nome: 'Linha 5567', status: 'ok', velocidade: '90 km/h', sensores: 6 },
  { id: 5, nome: 'Linha 3321', status: 'ok', velocidade: '85 km/h', sensores: 4 },
]

const initialSensors = [
  { id: 1, nome: 'Sensor A1', status: 'ok', linha: 'Linha 1778' },
  { id: 2, nome: 'Sensor A2', status: 'ok', linha: 'Linha 1778' },
  { id: 3, nome: 'Sensor B1', status: 'error', linha: 'Linha 0912' },
  { id: 4, nome: 'Sensor B2', status: 'ok', linha: 'Linha 0912' },
  { id: 5, nome: 'Sensor C1', status: 'ok', linha: 'Linha 2341' },
  { id: 6, nome: 'Sensor C2', status: 'ok', linha: 'Linha 2341' },
  { id: 7, nome: 'Sensor D1', status: 'ok', linha: 'Linha 5567' },
  { id: 8, nome: 'Sensor D2', status: 'ok', linha: 'Linha 5567' },
  { id: 9, nome: 'Sensor E1', status: 'ok', linha: 'Linha 3321' },
  { id: 10, nome: 'Sensor E2', status: 'ok', linha: 'Linha 3321' },
]

const FINALIZATION_EXPIRY_MS = 30 * 60 * 1000

export default function Dashboard() {
  const [lines] = useState(initialLines)
  const [sensors] = useState(initialSensors)
  const [maintenances, setMaintenances] = useState([
    {
      id: 1,
      linha: 'Linha 0912',
      motivo: 'Falha no trilho',
      setor: 'Setor Norte',
      statusFinalizacao: 'pendente',
      timestamp: Date.now() - 3600000,
    },
  ])
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
  const [showFinalized, setShowFinalized] = useState(false)

  const activeLines = lines.filter((l) => l.status === 'ok').length
  const totalSensors = sensors.length
  const activeSensors = sensors.filter((s) => s.status === 'ok').length
  const pendingMaintenances = maintenances.filter((m) => m.statusFinalizacao === 'pendente').length

  const finalizedMaintenances = maintenances.filter(
    (m) =>
      m.statusFinalizacao === 'finalizada' &&
      m.finalizedAt &&
      Date.now() - m.finalizedAt < FINALIZATION_EXPIRY_MS,
  )

  useEffect(() => {
    const interval = setInterval(() => {
      setMaintenances((prev) => [...prev])
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const handleAddMaintenance = (newMaintenance) => {
    setMaintenances((prev) => [newMaintenance, ...prev])
  }

  const handleFinalize = (id) => {
    setMaintenances((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, statusFinalizacao: 'finalizada', finalizedAt: Date.now() } : m,
      ),
    )
    setSelectedMaintenance(null)
  }

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="px-6 pt-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <img src={logo} alt="Ferrovia Santa Cruz" className="h-14 w-14" />
        </div>

        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatusCard
            icon={BarChart3}
            label="Linhas ativas"
            value={`${activeLines} / ${lines.length}`}
            status="ok"
          />
          <StatusCard
            icon={Radio}
            label="Sensores"
            value={`${activeSensors} / ${totalSensors}`}
            status={activeSensors === totalSensors ? 'ok' : 'warning'}
          />
          <StatusCard
            icon={Wrench}
            label="Manutenções"
            value={pendingMaintenances}
            status={pendingMaintenances > 0 ? 'error' : 'ok'}
          />
          <StatusCard icon={Gauge} label="Velocidade média" value="82 km/h" status="ok" />
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-3xl bg-accent p-5">
            <h2 className="mb-4 text-lg font-bold text-primary-foreground">Status das Linhas</h2>
            <div className="flex flex-col gap-3">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="flex items-center justify-between rounded-2xl bg-primary p-4"
                >
                  <div className="flex items-center gap-3">
                    <Train size={20} className="text-primary-foreground" />
                    <div>
                      <p className="text-sm font-semibold text-primary-foreground">{line.nome}</p>
                      <p className="text-xs text-foreground/70">{line.velocidade}</p>
                    </div>
                  </div>
                  <div
                    className={`h-3 w-3 rounded-full ${line.status === 'ok' ? 'bg-success' : 'bg-destructive'}`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-3xl bg-accent p-5">
            <h2 className="mb-4 text-lg font-bold text-primary-foreground">Sensores</h2>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
              {sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  className="flex flex-col items-center gap-2 rounded-xl bg-primary p-3"
                >
                  <Radio
                    size={20}
                    className={sensor.status === 'ok' ? 'text-success' : 'text-destructive'}
                  />
                  <p className="text-center text-xs font-medium text-primary-foreground">
                    {sensor.nome}
                  </p>
                  <p className="text-center text-[10px] text-primary-foreground/70">
                    {sensor.linha}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {pendingMaintenances > 0 && (
            <div className="rounded-3xl bg-accent p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-primary-foreground">Manutenções Pendentes</h2>
                <AlertTriangle size={20} className="text-destructive" />
              </div>
              <div className="flex flex-col gap-3">
                {maintenances
                  .filter((m) => m.statusFinalizacao === 'pendente')
                  .map((maintenance) => (
                    <div
                      key={maintenance.id}
                      className="flex cursor-pointer items-center justify-between rounded-2xl bg-primary p-4 transition-colors hover:bg-primary/90"
                      onClick={() => setSelectedMaintenance(maintenance)}
                    >
                      <div>
                        <p className="text-sm font-semibold text-primary-foreground">
                          {maintenance.linha}
                        </p>
                        <p className="text-xs text-primary-foreground/70">{maintenance.motivo}</p>
                      </div>
                      <Eye size={18} className="text-primary-foreground" />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {finalizedMaintenances.length > 0 && (
            <div className="rounded-3xl bg-accent p-5">
              <button
                onClick={() => setShowFinalized(!showFinalized)}
                className="mb-4 flex w-full items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-primary-foreground">
                    Manutenções Finalizadas
                  </h2>
                  <CheckCircle size={18} className="text-success" />
                </div>
                {showFinalized ? (
                  <ChevronUp size={20} className="text-foreground" />
                ) : (
                  <ChevronDown size={20} className="text-foreground" />
                )}
              </button>
              {showFinalized && (
                <div className="flex flex-col gap-3">
                  {finalizedMaintenances.map((maintenance) => (
                    <div
                      key={maintenance.id}
                      className="flex items-center justify-between rounded-2xl bg-primary/70 p-4"
                    >
                      <div>
                        <p className="text-sm font-medium text-primary-foreground">
                          {maintenance.linha}
                        </p>
                        <p className="text-xs text-primary-foreground/70">{maintenance.motivo}</p>
                        <p className="mt-1 text-[10px] text-primary-foreground/60">
                          Finalizada há {Math.round((Date.now() - maintenance.finalizedAt) / 60000)}{' '}
                          min
                        </p>
                      </div>
                      <CheckCircle size={18} className="text-success" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex justify-center">
          <Button onClick={() => setShowMaintenanceModal(true)} className="w-auto px-10">
            Cadastrar Manutenção
          </Button>
        </div>
      </div>

      {showMaintenanceModal && (
        <MaintenanceModal
          onClose={() => setShowMaintenanceModal(false)}
          onAdd={handleAddMaintenance}
        />
      )}

      {selectedMaintenance && (
        <MaintenanceDetail
          maintenance={selectedMaintenance}
          onClose={() => setSelectedMaintenance(null)}
          onFinalize={handleFinalize}
        />
      )}

      <BottomNav />
    </div>
  )
}
