import { useState } from 'react'
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader'
import FormField from '../../components/FormField/FormField'
import Button from '../../components/Button/Button'
import BottomNav from '../../components/BottomNav/BottomNav'

const notificacoesEnviadas = [
  { linha: 'Linha 1778', espera: '15 a 30 min', motivo: 'manutenção no trilho', status: 'Parado' },
]

export default function Alertas() {
  const [formData, setFormData] = useState({
    linha: '',
    espera: '',
    motivo: '',
    status: '',
  })

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setFormData({ linha: '', espera: '', motivo: '', status: '' })
  }

  return (
    <div className="min-h-screen bg-bg-base pb-28">
      <div className="px-6 pt-8">
        <ScreenHeader title="Alerta e Notificações" showBack={true} />

        <div className="flex justify-end mb-6">
          <div className="bg-componente1 text-texto2 text-sm font-semibold rounded-full px-6 py-2">
            Notificações enviadas
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 bg-componente1 rounded-3xl p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField id="linha" label="Nome da linha:" placeholder="" value={formData.linha} onChange={handleChange('linha')} />
              <FormField id="espera" label="Tempo de espera:" placeholder="" value={formData.espera} onChange={handleChange('espera')} />
              <FormField id="motivo" label="Motivo:" placeholder="" value={formData.motivo} onChange={handleChange('motivo')} />
              <FormField id="status" label="Status" placeholder="" value={formData.status} onChange={handleChange('status')} />
              <div className="flex justify-center mt-2">
                <Button type="submit" variant="secondary" className="w-auto px-10">Enviar</Button>
              </div>
            </form>
          </div>

          <div className="flex-1 bg-componente1 rounded-3xl p-6">
            <div className="flex flex-col gap-4">
              {notificacoesEnviadas.map((n, i) => (
                <div key={i} className="bg-componente3 rounded-2xl p-5 flex flex-col gap-3">
                  <p className="text-sm font-medium text-texto2">{n.linha}</p>
                  <p className="text-sm text-texto2">Tempo de espera: {n.espera}</p>
                  <p className="text-sm text-texto2">Motivo: {n.motivo}</p>
                  <p className="text-sm text-texto2">Status: {n.status}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  )
}
