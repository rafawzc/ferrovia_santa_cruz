import { useState } from 'react'
import { ChevronDown, ChevronUp, Package, Users, Train } from 'lucide-react'
import Tabs from '../../components/Tabs/Tabs'
import WagonIcon from '../../components/WagonIcon/WagonIcon'
import CargoModal from '../../components/CargoModal/CargoModal'
import PassengerModal from '../../components/PassengerModal/PassengerModal'
import WagonDetail from '../../components/WagonDetail/WagonDetail'
import Button from '../../components/Button/Button'
import BottomNav from '../../components/BottomNav/BottomNav'

const tabs = [
  { id: 'carga', label: 'Carga' },
  { id: 'passageiros', label: 'Passageiros' },
]

const trenes = [
  { id: 1, nome: 'Trem 01' },
  { id: 2, nome: 'Trem 02' },
  { id: 3, nome: 'Trem 03' },
]

const vagoesPorTrem = {
  1: { A: 45, B: 85, C: 30, D: 60, E: 95, F: 20, G: 70, H: 40 },
  2: { A: 60, B: 40, C: 75, D: 30, E: 55, F: 80, G: 25, H: 50 },
  3: { A: 35, B: 70, C: 50, D: 85, E: 40, F: 60, G: 90, H: 30 },
}

const passageirosPorTrem = {
  1: {
    A: [0, 1, 2, 3, 4, 5, 8, 9, 10, 11],
    B: [0, 1, 2, 3, 8, 9],
    C: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    D: [0, 1, 2, 3, 4, 5, 6, 7],
    E: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    F: [0, 1, 2, 3],
    G: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    H: [0, 1, 2, 3, 4, 5, 6, 7, 8],
  },
  2: {
    A: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    B: [0, 1, 2, 3, 4, 5, 6, 7],
    C: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    D: [0, 1, 2, 3, 4, 5],
    E: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    F: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    G: [0, 1, 2, 3, 4],
    H: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  },
  3: {
    A: [0, 1, 2, 3, 4, 5, 6],
    B: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
    C: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    D: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    E: [0, 1, 2, 3, 4, 5, 6, 7],
    F: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    G: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15],
    H: [0, 1, 2, 3, 4, 5],
  },
}

export default function CargaLista() {
  const [activeTab, setActiveTab] = useState('carga')
  const [selectedTrainCarga, setSelectedTrainCarga] = useState(1)
  const [selectedTrainPassageiro, setSelectedTrainPassageiro] = useState(1)
  const [selectedWagonPassageiro, setSelectedWagonPassageiro] = useState('A')
  const [selectedWagon, setSelectedWagon] = useState(null)
  const [showCargoModal, setShowCargoModal] = useState(false)
  const [showPassengerModal, setShowPassengerModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)
  const [cargos, setCargos] = useState([])
  const [passageiros, setPassageiros] = useState(passageirosPorTrem)
  const [vagoesData, setVagoesData] = useState(vagoesPorTrem)

  const vagoesCarga = vagoesData[selectedTrainCarga]
  const totalVagoes = Object.keys(vagoesCarga).length
  const vagoesOcupados = Object.values(vagoesCarga).filter((p) => p >= 90).length
  const vagoesDisponiveis = Object.values(vagoesCarga).filter((p) => p < 70).length
  const vagoesQuaseLotados = Object.values(vagoesCarga).filter((p) => p >= 70 && p < 90).length

  const passageirosAtuais = passageiros[selectedTrainPassageiro]?.[selectedWagonPassageiro] || []
  const totalPoltronas = 16
  const poltronasOcupadas = passageirosAtuais.length
  const poltronasDisponiveis = totalPoltronas - poltronasOcupadas

  const handleAddCargo = (newCargo) => {
    setCargos((prev) => [newCargo, ...prev])
    setVagoesData((prev) => {
      const trainData = { ...prev[selectedTrainCarga] }
      const currentPercentage = trainData[newCargo.vagao] || 0
      const newPercentage = Math.min(100, currentPercentage + 10)
      return {
        ...prev,
        [selectedTrainCarga]: {
          ...trainData,
          [newCargo.vagao]: newPercentage,
        },
      }
    })
  }

  const handleAddPassenger = (newPassenger) => {
    setPassageiros((prev) => {
      const trainData = prev[newPassenger.trem] || {}
      const wagonData = trainData[newPassenger.vagao] || []
      return {
        ...prev,
        [newPassenger.trem]: {
          ...trainData,
          [newPassenger.vagao]: [...wagonData, ...newPassenger.assentos],
        },
      }
    })
  }

  const handleWagonClick = (letter) => {
    setSelectedWagon({ letter, percentage: vagoesCarga[letter] })
  }

  const renderPassengerSeats = () => {
    const topRow = [0, 1, 2, 3, 4, 5, 6, 7]
    const bottomRow = [8, 9, 10, 11, 12, 13, 14, 15]

    return (
      <div className="flex flex-col items-center gap-1">
        <div className="flex gap-1">
          {topRow.map((seatIndex) => (
            <div
              key={seatIndex}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                passageirosAtuais.includes(seatIndex) ? 'bg-error' : 'bg-success'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-1">
          {bottomRow.map((seatIndex) => (
            <div
              key={seatIndex}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                passageirosAtuais.includes(seatIndex) ? 'bg-error' : 'bg-success'
              }`}
            />
          ))}
        </div>

        <div className="w-full h-px bg-texto2/30 my-1" />

        <div className="flex gap-1">
          {topRow.map((seatIndex) => (
            <div
              key={seatIndex + 8}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                passageirosAtuais.includes(seatIndex + 8) ? 'bg-error' : 'bg-success'
              }`}
            />
          ))}
        </div>

        <div className="flex gap-1">
          {bottomRow.map((seatIndex) => (
            <div
              key={seatIndex + 8}
              className={`w-4 h-4 rounded-full transition-all duration-200 ${
                passageirosAtuais.includes(seatIndex + 8) ? 'bg-error' : 'bg-success'
              }`}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bg-page pb-28">
      <div className="px-6 pt-8 max-w-4xl mx-auto">
        <h1 className="text-xl lg:text-2xl font-bold text-texto1 text-center mb-6">
          Monitoramento de Carga<br />e Passageiro
        </h1>

        <div className="flex justify-start mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === 'carga' && (
          <div className="flex flex-col gap-6">
            <div className="bg-componente1 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-texto2 flex items-center gap-2">
                  <Package size={20} />
                  Carga
                </h2>
                <div className="flex items-center gap-2">
                  <Train size={16} className="text-texto2" />
                  <select
                    value={selectedTrainCarga}
                    onChange={(e) => setSelectedTrainCarga(Number(e.target.value))}
                    className="bg-componente3 text-texto2 text-sm rounded-full px-4 py-2 border-none focus:ring-2 focus:ring-componente1/30"
                  >
                    {trenes.map((t) => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-componente3 rounded-2xl p-4 mb-4">
                <p className="text-sm font-medium text-texto2 mb-1">Limite de carga por vagão</p>
                <p className="text-xl font-bold text-texto2">170 Toneladas</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-componente3/50 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-texto2">{totalVagoes}</p>
                  <p className="text-xs text-texto2/70">Total</p>
                </div>
                <div className="bg-success/20 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-success">{vagoesDisponiveis}</p>
                  <p className="text-xs text-texto2/70">Disponíveis</p>
                </div>
                <div className="bg-yellow-500/20 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-yellow-600">{vagoesQuaseLotados}</p>
                  <p className="text-xs text-texto2/70">Quase lotados</p>
                </div>
                <div className="bg-error/20 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-error">{vagoesOcupados}</p>
                  <p className="text-xs text-texto2/70">Lotados</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-success" />
                  <span className="text-xs text-texto2">Disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-yellow-500" />
                  <span className="text-xs text-texto2">Quase lotado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-error" />
                  <span className="text-xs text-texto2">Lotado</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-texto2 mb-3">Vagões disponíveis</p>
                <div className="grid grid-cols-4 gap-3">
                  {Object.entries(vagoesCarga).map(([letter, percentage]) => (
                    <WagonIcon
                      key={letter}
                      letter={letter}
                      percentage={percentage}
                      onClick={() => handleWagonClick(letter)}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => setShowCargoModal(true)} className="w-auto px-8">
                Cadastrar Carga
              </Button>
            </div>

            {cargos.length > 0 && (
              <div className="bg-componente1 rounded-3xl p-4">
                <button
                  onClick={() => setShowHistory(!showHistory)}
                  className="flex items-center justify-between w-full mb-3"
                >
                  <h2 className="text-base font-bold text-texto2">Histórico de Cargas</h2>
                  {showHistory ? <ChevronUp size={18} className="text-texto2" /> : <ChevronDown size={18} className="text-texto2" />}
                </button>
                {showHistory && (
                  <div className="flex flex-col gap-2">
                    {cargos.map((cargo) => (
                      <div key={cargo.id} className="bg-componente3 rounded-xl p-3">
                        <div className="flex justify-between items-center mb-1">
                          <p className="text-sm font-semibold text-texto1">{cargo.tipo}</p>
                          <span className="text-xs text-texto1/70">
                            {new Date(cargo.timestamp).toLocaleString('pt-BR')}
                          </span>
                        </div>
                        <p className="text-xs text-texto1">Peso: {cargo.peso}t | Vagão: {cargo.vagao}</p>
                        <p className="text-xs text-texto1/70">{cargo.partida} → {cargo.destino}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'passageiros' && (
          <div className="flex flex-col gap-6">
            <div className="bg-componente1 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-texto2 flex items-center gap-2">
                  <Users size={20} />
                  Passageiros
                </h2>
                <div className="flex items-center gap-2">
                  <Train size={16} className="text-texto2" />
                  <select
                    value={selectedTrainPassageiro}
                    onChange={(e) => {
                      setSelectedTrainPassageiro(Number(e.target.value))
                      setSelectedWagonPassageiro('A')
                    }}
                    className="bg-componente3 text-texto2 text-sm rounded-full px-4 py-2 border-none focus:ring-2 focus:ring-componente1/30"
                  >
                    {trenes.map((t) => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-componente3 rounded-2xl p-4 mb-4">
                <p className="text-sm font-medium text-texto2 mb-1">Limite de pessoas por vagão</p>
                <p className="text-xl font-bold text-texto2">24 Pessoas</p>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                <div className="bg-componente3/50 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-texto2">{totalPoltronas}</p>
                  <p className="text-xs text-texto2/70">Total</p>
                </div>
                <div className="bg-success/20 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-success">{poltronasDisponiveis}</p>
                  <p className="text-xs text-texto2/70">Disponíveis</p>
                </div>
                <div className="bg-error/20 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-error">{poltronasOcupadas}</p>
                  <p className="text-xs text-texto2/70">Ocupadas</p>
                </div>
                <div className="bg-componente3/50 rounded-xl p-2 text-center">
                  <p className="text-xl font-bold text-texto2">8</p>
                  <p className="text-xs text-texto2/70">Vagões</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-success" />
                  <span className="text-xs text-texto2">Livre</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-error" />
                  <span className="text-xs text-texto2">Ocupado</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-sm font-medium text-texto2 mb-3">Vagões disponíveis</p>
                <div className="grid grid-cols-4 gap-3">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((letter) => {
                    const ocupadas = passageiros[selectedTrainPassageiro]?.[letter]?.length || 0
                    const percentage = Math.round((ocupadas / 24) * 100)
                    return (
                      <WagonIcon
                        key={letter}
                        letter={letter}
                        percentage={percentage}
                        onClick={() => setSelectedWagonPassageiro(letter)}
                      />
                    )
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-medium text-texto2">
                  Poltronas no vagão {selectedWagonPassageiro}
                </p>
                <select
                  value={selectedWagonPassageiro}
                  onChange={(e) => setSelectedWagonPassageiro(e.target.value)}
                  className="bg-componente3 text-texto2 text-sm rounded-full px-4 py-2 border-none focus:ring-2 focus:ring-componente1/30"
                >
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((v) => (
                    <option key={v} value={v}>Vagão {v}</option>
                  ))}
                </select>
              </div>

              <div className="bg-componente3 rounded-2xl p-4">
                {renderPassengerSeats()}
                <div className="flex justify-center gap-4 mt-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-success" />
                    <span className="text-xs text-texto2">Livre</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-error" />
                    <span className="text-xs text-texto2">Ocupado</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button onClick={() => setShowPassengerModal(true)} className="w-auto px-8">
                Cadastrar Passageiro
              </Button>
            </div>
          </div>
        )}
      </div>

      {showCargoModal && (
        <CargoModal
          onClose={() => setShowCargoModal(false)}
          onAdd={handleAddCargo}
          selectedTrain={selectedTrainCarga}
        />
      )}

      {showPassengerModal && (
        <PassengerModal
          onClose={() => setShowPassengerModal(false)}
          onAdd={handleAddPassenger}
          poltronasOcupadas={passageiros}
        />
      )}

      {selectedWagon && (
        <WagonDetail
          wagon={selectedWagon.letter}
          percentage={selectedWagon.percentage}
          onClose={() => setSelectedWagon(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}
