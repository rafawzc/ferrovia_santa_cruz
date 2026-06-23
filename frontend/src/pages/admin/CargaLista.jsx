import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Tabs from '../../components/Tabs/Tabs'
import BottomNav from '../../components/BottomNav/BottomNav'

const tabs = [
  { id: 'carga', label: 'Carga' },
  { id: 'cadastro', label: 'Cadastro' },
  { id: 'passageiros', label: 'Passageiros' },
]

const vagaoColors = {
  A: 'bg-green-600', B: 'bg-red-500', C: 'bg-green-600', D: 'bg-green-600',
  E: 'bg-red-500', F: 'bg-red-500', G: 'bg-green-600', H: 'bg-red-500',
}

const poltronas = Array.from({ length: 16 }, (_, i) => i < 8)

export default function CargaLista() {
  const [activeTab, setActiveTab] = useState('carga')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg-base pb-28">
      <div className="px-6 pt-8">
        <h1 className="text-xl lg:text-2xl font-bold text-texto1 text-center mb-6">
          Monitoramento de Carga<br />e Passageiro
        </h1>

        <div className="flex justify-start mb-6">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === 'carga' && (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 bg-componente1 rounded-3xl p-6">
              <div className="bg-componente3 rounded-2xl p-5 mb-4">
                <p className="text-sm font-medium text-texto2 mb-2">Limite de carga por vagão</p>
                <p className="text-2xl font-bold text-texto2">170 Toneladas</p>
              </div>

              <div className="flex gap-6 mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-green-600" />
                  <span className="text-xs text-texto2">Vagão disponível</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-red-500" />
                  <span className="text-xs text-texto2">Vagão lotado</span>
                </div>
              </div>

              <div>
                <p className="text-sm font-medium text-texto2 mb-3">vagões disponíveis</p>
                <div className="grid grid-cols-4 gap-3">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((v) => (
                    <div key={v} className="flex flex-col items-center gap-1">
                      <div className={`w-14 h-10 rounded-lg ${vagaoColors[v]} flex items-center justify-center`}>
                        <span className="text-texto2 text-xs font-bold">{v}</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="w-2.5 h-2.5 rounded-full bg-texto2/80" />
                        <div className="w-2.5 h-2.5 rounded-full bg-texto2/80" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 bg-componente1 rounded-3xl p-6">
              <div className="bg-componente3 rounded-2xl p-5 mb-4">
                <p className="text-sm font-medium text-texto2 mb-2">Limite de pessoas por vagão</p>
                <p className="text-2xl font-bold text-texto2">24 Pessoas</p>
              </div>

              <div className="flex flex-wrap gap-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-green-600" />
                  <span className="text-xs text-texto2">Vagão disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 rounded-t-full bg-green-600" />
                  <span className="text-xs text-texto2">Poltrona disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded bg-red-500" />
                  <span className="text-xs text-texto2">Vagão lotado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 rounded-t-full bg-red-400" />
                  <span className="text-xs text-texto2">Poltrona indisponível</span>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3 mb-4">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((v) => (
                  <div key={v} className="flex flex-col items-center gap-1">
                    <div className={`w-14 h-10 rounded-lg ${v === 'F' ? 'bg-red-500' : 'bg-green-600'} flex items-center justify-center`}>
                      <span className="text-texto2 text-xs font-bold">{v}</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="w-2.5 h-2.5 rounded-full bg-texto2/80" />
                      <div className="w-2.5 h-2.5 rounded-full bg-texto2/80" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-componente3 rounded-2xl p-4">
                <p className="text-sm font-medium text-texto2 mb-3">Poltronas disponível no vagão F</p>
                <div className="grid grid-cols-4 gap-2">
                  {poltronas.map((disponivel, i) => (
                    <div key={i} className={`w-full h-8 rounded-t-full ${disponivel ? 'bg-green-600' : 'bg-red-400'}`} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cadastro' && (
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/admin/carga/cadastro')}
              className="bg-componente1 text-texto2 font-semibold rounded-full px-8 py-3 hover:opacity-90 transition-opacity cursor-pointer"
            >
              Cadastrar Carga
            </button>
          </div>
        )}

        {activeTab === 'passageiros' && (
          <div className="bg-componente1 rounded-3xl p-6">
            <p className="text-texto2 text-center">Monitoramento de passageiros</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
