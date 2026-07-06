import { useState, useEffect } from 'react'
import { BarChart3, Wrench, Radio, Gauge, Train, AlertTriangle, Eye, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
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
    { id: 1, linha: 'Linha 0912', motivo: 'Falha no trilho', setor: 'Setor Norte', statusFinalizacao: 'pendente', timestamp: Date.now() - 3600000 },
  ])
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false)
  const [selectedMaintenance, setSelectedMaintenance] = useState(null)
  const [showFinalized, setShowFinalized] = useState(false)

  const activeLines = lines.filter((l) => l.status === 'ok').length
  const totalSensors = sensors.length
  const activeSensors = sensors.filter((s) => s.status === 'ok').length
  const pendingMaintenances = maintenances.filter((m) => m.statusFinalizacao === 'pendente').length

  const finalizedMaintenances = maintenances.filter(
    (m) => m.statusFinalizacao === 'finalizada' && m.finalizedAt && (Date.now() - m.finalizedAt) < FINALIZATION_EXPIRY_MS
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
      prev.map((m) => (m.id === id ? { ...m, statusFinalizacao: 'finalizada', finalizedAt: Date.now() } : m))
    )
    setSelectedMaintenance(null)
  }

  return (
    <div className="min-h-screen bg-bg-page pb-28">
      <div className="px-6 pt-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-texto1">Dashboard</h1>
          <img src={logo} alt="Ferrovia Santa Cruz" className="w-14 h-14" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatusCard icon={BarChart3} label="Linhas ativas" value={`${activeLines} / ${lines.length}`} status="ok" />
          <StatusCard icon={Radio} label="Sensores" value={`${activeSensors} / ${totalSensors}`} status={activeSensors === totalSensors ? 'ok' : 'warning'} />
          <StatusCard icon={Wrench} label="Manutenções" value={pendingMaintenances} status={pendingMaintenances > 0 ? 'error' : 'ok'} />
          <StatusCard icon={Gauge} label="Velocidade média" value="82 km/h" status="ok" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div className="bg-componente4 rounded-3xl p-5">
            <h2 className="text-lg font-bold text-texto2 mb-4">Status das Linhas</h2>
            <div className="flex flex-col gap-3">
              {lines.map((line) => (
                <div
                  key={line.id}
                  className="bg-componente1 rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <Train size={20} className="text-texto2" />
                    <div>
                      <p className="text-sm font-semibold text-texto2">{line.nome}</p>
                      <p className="text-xs text-texto1/70">{line.velocidade}</p>
                    </div>
                  </div>
                  <div className={`w-3 h-3 rounded-full ${line.status === 'ok' ? 'bg-success' : 'bg-error'}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-componente4 rounded-3xl p-5">
            <h2 className="text-lg font-bold text-texto2 mb-4">Sensores</h2>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
              {sensors.map((sensor) => (
                <div
                  key={sensor.id}
                  className="bg-componente1 rounded-xl p-3 flex flex-col items-center gap-2"
                >
                  <Radio size={20} className={sensor.status === 'ok' ? 'text-success' : 'text-error'} />
                  <p className="text-xs font-medium text-texto2 text-center">{sensor.nome}</p>
                  <p className="text-[10px] text-texto2/70 text-center">{sensor.linha}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {pendingMaintenances > 0 && (
            <div className="bg-componente4 rounded-3xl p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-texto2">Manutenções Pendentes</h2>
                <AlertTriangle size={20} className="text-error" />
              </div>
              <div className="flex flex-col gap-3">
                {maintenances
                  .filter((m) => m.statusFinalizacao === 'pendente')
                  .map((maintenance) => (
                    <div
                      key={maintenance.id}
                      className="bg-componente1 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-componente1/90 transition-colors"
                      onClick={() => setSelectedMaintenance(maintenance)}
                    >
                      <div>
                        <p className="text-sm font-semibold text-texto2">{maintenance.linha}</p>
                        <p className="text-xs text-texto2/70">{maintenance.motivo}</p>
                      </div>
                      <Eye size={18} className="text-texto2" />
                    </div>
                  ))}
              </div>
            </div>
          )}

          {finalizedMaintenances.length > 0 && (
            <div className="bg-componente4 rounded-3xl p-5">
              <button
                onClick={() => setShowFinalized(!showFinalized)}
                className="flex items-center justify-between w-full mb-4"
              >
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-texto2">Manutenções Finalizadas</h2>
                  <CheckCircle size={18} className="text-success" />
                </div>
                {showFinalized ? <ChevronUp size={20} className="text-texto1" /> : <ChevronDown size={20} className="text-texto1" />}
              </button>
              {showFinalized && (
                <div className="flex flex-col gap-3">
                  {finalizedMaintenances.map((maintenance) => (
                    <div
                      key={maintenance.id}
                      className="bg-componente1/70 rounded-2xl p-4 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium text-texto2">{maintenance.linha}</p>
                        <p className="text-xs text-texto2/70">{maintenance.motivo}</p>
                        <p className="text-[10px] text-texto2/60 mt-1">
                          Finalizada há {Math.round((Date.now() - maintenance.finalizedAt) / 60000)} min
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
        <MaintenanceModal onClose={() => setShowMaintenanceModal(false)} onAdd={handleAddMaintenance} />
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
