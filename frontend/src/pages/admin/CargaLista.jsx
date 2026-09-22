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
  A: 'bg-green-600',
  B: 'bg-red-500',
  C: 'bg-green-600',
  D: 'bg-green-600',
  E: 'bg-red-500',
  F: 'bg-red-500',
  G: 'bg-green-600',
  H: 'bg-red-500',
}

const poltronas = Array.from({ length: 16 }, (_, i) => i < 8)

export default function CargaLista() {
  const [activeTab, setActiveTab] = useState('carga')
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-bg pb-28">
      <div className="px-6 pt-8">
        <h1 className="mb-6 text-center text-xl font-bold text-text lg:text-2xl">
          Monitoramento de Carga
          <br />e Passageiro
        </h1>

        <div className="mb-6 flex justify-start">
          <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {activeTab === 'carga' && (
          <div className="flex flex-col gap-6 lg:flex-row">
            <div className="flex-1 rounded-3xl bg-primary p-6">
              <div className="mb-4 rounded-2xl bg-surface p-5">
                <p className="mb-2 text-sm font-medium text-on-primary">
                  Limite de carga por vagão
                </p>
                <p className="text-2xl font-bold text-on-primary">170 Toneladas</p>
              </div>

              <div className="mb-4 flex gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-green-600" />
                  <span className="text-xs text-on-primary">Vagão disponível</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-red-500" />
                  <span className="text-xs text-on-primary">Vagão lotado</span>
                </div>
              </div>

              <div>
                <p className="mb-3 text-sm font-medium text-on-primary">vagões disponíveis</p>
                <div className="grid grid-cols-4 gap-3">
                  {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((v) => (
                    <div key={v} className="flex flex-col items-center gap-1">
                      <div
                        className={`h-10 w-14 rounded-lg ${vagaoColors[v]} flex items-center justify-center`}
                      >
                        <span className="text-xs font-bold text-on-primary">{v}</span>
                      </div>
                      <div className="flex gap-1">
                        <div className="h-2.5 w-2.5 rounded-full bg-on-primary/80" />
                        <div className="h-2.5 w-2.5 rounded-full bg-on-primary/80" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex-1 rounded-3xl bg-primary p-6">
              <div className="mb-4 rounded-2xl bg-surface p-5">
                <p className="mb-2 text-sm font-medium text-on-primary">
                  Limite de pessoas por vagão
                </p>
                <p className="text-2xl font-bold text-on-primary">24 Pessoas</p>
              </div>

              <div className="mb-4 flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-sm bg-green-600" />
                  <span className="text-xs text-on-primary">Vagão disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-8 rounded-t-full bg-green-600" />
                  <span className="text-xs text-on-primary">Poltrona disponível</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-sm bg-red-500" />
                  <span className="text-xs text-on-primary">Vagão lotado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-6 w-8 rounded-t-full bg-red-400" />
                  <span className="text-xs text-on-primary">Poltrona indisponível</span>
                </div>
              </div>

              <div className="mb-4 grid grid-cols-4 gap-3">
                {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((v) => (
                  <div key={v} className="flex flex-col items-center gap-1">
                    <div
                      className={`h-10 w-14 rounded-lg ${v === 'F' ? 'bg-red-500' : 'bg-green-600'} flex items-center justify-center`}
                    >
                      <span className="text-xs font-bold text-on-primary">{v}</span>
                    </div>
                    <div className="flex gap-1">
                      <div className="h-2.5 w-2.5 rounded-full bg-on-primary/80" />
                      <div className="h-2.5 w-2.5 rounded-full bg-on-primary/80" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="rounded-2xl bg-surface p-4">
                <p className="mb-3 text-sm font-medium text-on-primary">
                  Poltronas disponível no vagão F
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {poltronas.map((disponivel, i) => (
                    <div
                      key={i}
                      className={`h-8 w-full rounded-t-full ${disponivel ? 'bg-green-600' : 'bg-red-400'}`}
                    />
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
              className="cursor-pointer rounded-full bg-primary px-8 py-3 font-semibold text-on-primary transition-opacity hover:opacity-90"
            >
              Cadastrar Carga
            </button>
          </div>
        )}

        {activeTab === 'passageiros' && (
          <div className="rounded-3xl bg-primary p-6">
            <p className="text-center text-on-primary">Monitoramento de passageiros</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
