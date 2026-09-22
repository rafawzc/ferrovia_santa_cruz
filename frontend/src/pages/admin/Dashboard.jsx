import { useState } from 'react'
import { BarChart3, Wrench, Radio } from 'lucide-react'
import InfoCard from '../../components/InfoCard/InfoCard'
import Modal from '../../components/Modal/Modal'
import FormField from '../../components/FormField/FormField'
import Button from '../../components/Button/Button'
import BottomNav from '../../components/BottomNav/BottomNav'

export default function Dashboard() {
  const [problema, setProblema] = useState({ motivo: '', linha: '', trem: '', setor: '' })
  const [horario, setHorario] = useState({ horas: '22', minutos: '50' })

  const handleProblemaChange = (field) => (e) => {
    setProblema((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleHorarioChange = (field) => (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 2)
    setHorario((prev) => ({ ...prev, [field]: val }))
  }

  return (
    <div className="min-h-screen bg-bg pb-28">
      <div className="px-6 pt-8">
        <div className="mb-4 flex justify-end">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary">
            <span className="text-center text-xs leading-tight font-bold text-on-primary">
              FERROVIA
              <br />
              SANTA CRUZ
            </span>
          </div>
        </div>

        <div className="mb-8 rounded-3xl bg-surface-2 p-5">
          <div className="flex flex-wrap gap-6">
            <InfoCard icon={BarChart3} label="Linhas ativas" value="10 / 07" />
            <InfoCard icon={Wrench} label="Manutenção" value="3" />
            <InfoCard icon={Radio} label="Sensores" value="10" />
          </div>
        </div>

        <h2 className="mb-6 text-center text-xl font-bold text-text">Cadastro de Manutenção</h2>

        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-1">
            <Modal title="Insira o Problema" onClose={() => {}}>
              <div className="flex flex-col gap-4">
                <FormField
                  id="motivo"
                  label="Motivo:"
                  placeholder=""
                  value={problema.motivo}
                  onChange={handleProblemaChange('motivo')}
                  onDark
                />
                <FormField
                  id="linha"
                  label="Linha:"
                  placeholder=""
                  value={problema.linha}
                  onChange={handleProblemaChange('linha')}
                  onDark
                />
                <FormField
                  id="trem"
                  label="Trem:"
                  placeholder=""
                  value={problema.trem}
                  onChange={handleProblemaChange('trem')}
                  onDark
                />
                <FormField
                  id="setor"
                  label="Setor:"
                  placeholder=""
                  value={problema.setor}
                  onChange={handleProblemaChange('setor')}
                  onDark
                />
                <div className="mt-2 flex justify-end">
                  <Button variant="secondary" onClick={() => {}} className="w-auto px-8">
                    Adicionar
                  </Button>
                </div>
              </div>
            </Modal>
          </div>

          <div className="flex-1">
            <Modal title="Insira o Horário" onClose={() => {}}>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      value={horario.horas}
                      onChange={handleHorarioChange('horas')}
                      className="h-20 w-20 rounded-xl bg-surface text-center text-3xl font-bold text-text focus:ring-2 focus:ring-primary/30"
                      maxLength={2}
                    />
                    <span className="mt-2 text-xs text-on-primary">Horas</span>
                  </div>
                  <span className="text-3xl font-bold text-on-primary">:</span>
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      value={horario.minutos}
                      onChange={handleHorarioChange('minutos')}
                      className="h-20 w-20 rounded-xl bg-surface text-center text-3xl font-bold text-text focus:ring-2 focus:ring-primary/30"
                      maxLength={2}
                    />
                    <span className="mt-2 text-xs text-on-primary">Minutos</span>
                  </div>
                </div>
                <div className="mt-2 flex justify-end">
                  <Button variant="secondary" onClick={() => {}} className="w-auto px-8">
                    Adicionar
                  </Button>
                </div>
              </div>
            </Modal>
          </div>
        </div>

        <div className="mt-8 flex justify-center">
          <Button onClick={() => {}} className="w-auto px-10">
            Cadastrar Manutenção
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
