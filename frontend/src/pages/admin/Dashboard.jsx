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
    <div className="min-h-screen bg-bg-base pb-28">
      <div className="px-6 pt-8">
        <div className="flex justify-end mb-4">
          <div className="w-12 h-12 rounded-full bg-componente1 flex items-center justify-center">
            <span className="text-texto2 text-xs font-bold text-center leading-tight">FERROVIA<br/>SANTA CRUZ</span>
          </div>
        </div>

        <div className="bg-componente4 rounded-3xl p-5 mb-8">
          <div className="flex flex-wrap gap-6">
            <InfoCard icon={BarChart3} label="Linhas ativas" value="10 / 07" />
            <InfoCard icon={Wrench} label="Manutenção" value="3" />
            <InfoCard icon={Radio} label="Sensores" value="10" />
          </div>
        </div>

        <h2 className="text-xl font-bold text-texto1 text-center mb-6">Cadastro de Manutenção</h2>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <Modal title="Insira o Problema" onClose={() => {}}>
              <div className="flex flex-col gap-4">
                <FormField id="motivo" label="Motivo:" placeholder="" value={problema.motivo} onChange={handleProblemaChange('motivo')} />
                <FormField id="linha" label="Linha:" placeholder="" value={problema.linha} onChange={handleProblemaChange('linha')} />
                <FormField id="trem" label="Trem:" placeholder="" value={problema.trem} onChange={handleProblemaChange('trem')} />
                <FormField id="setor" label="Setor:" placeholder="" value={problema.setor} onChange={handleProblemaChange('setor')} />
                <div className="flex justify-end mt-2">
                  <Button variant="secondary" onClick={() => {}} className="w-auto px-8">Adicionar</Button>
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
                      className="w-20 h-20 bg-componente3 rounded-xl text-center text-3xl font-bold text-texto1 focus:ring-2 focus:ring-componente1/30"
                      maxLength={2}
                    />
                    <span className="text-xs text-texto2 mt-2">Horas</span>
                  </div>
                  <span className="text-3xl font-bold text-texto2">:</span>
                  <div className="flex flex-col items-center">
                    <input
                      type="text"
                      value={horario.minutos}
                      onChange={handleHorarioChange('minutos')}
                      className="w-20 h-20 bg-componente3 rounded-xl text-center text-3xl font-bold text-texto1 focus:ring-2 focus:ring-componente1/30"
                      maxLength={2}
                    />
                    <span className="text-xs text-texto2 mt-2">Minutos</span>
                  </div>
                </div>
                <div className="flex justify-end mt-2">
                  <Button variant="secondary" onClick={() => {}} className="w-auto px-8">Adicionar</Button>
                </div>
              </div>
            </Modal>
          </div>
        </div>

        <div className="flex justify-center mt-8">
          <Button onClick={() => {}} className="w-auto px-10">Cadastrar Manutenção</Button>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
