import { useState } from 'react'
import { Clock, ChevronDown, ChevronUp } from 'lucide-react'
import ScreenHeader from '../../components/ScreenHeader/ScreenHeader'
import FormField from '../../components/FormField/FormField'
import Button from '../../components/Button/Button'
import Toast from '../../components/Toast/Toast'
import BottomNav from '../../components/BottomNav/BottomNav'

export default function Alertas() {
  const [formData, setFormData] = useState({
    linha: '',
    espera: '',
    motivo: '',
    status: '',
  })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)
  const [history, setHistory] = useState([])
  const [showHistory, setShowHistory] = useState(false)

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.linha.trim()) newErrors.linha = 'Preencha o nome da linha'
    if (!formData.espera.trim()) newErrors.espera = 'Preencha o tempo de espera'
    if (!formData.motivo.trim()) newErrors.motivo = 'Preencha o motivo'
    if (!formData.status.trim()) newErrors.status = 'Preencha o status'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const newNotification = {
        ...formData,
        timestamp: Date.now(),
      }
      setHistory((prev) => [newNotification, ...prev])
      setFormData({ linha: '', espera: '', motivo: '', status: '' })
      setToast({ message: 'Notificação enviada com sucesso!', type: 'success' })
    } catch {
      setToast({ message: 'Erro ao enviar notificação.', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  const getRecentHistory = () => {
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000
    return history.filter((item) => item.timestamp > thirtyMinutesAgo)
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const recentHistory = getRecentHistory()

  return (
    <div className="min-h-screen bg-bg-page pb-28">
      <div className="px-6 pt-8">
        <div className="flex justify-center">
          <ScreenHeader title="Alerta e Notificações" showBack={false} />
        </div>

        <div className="flex justify-center mt-8">
          <div className="w-full max-w-md bg-componente1 rounded-3xl p-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <FormField
                id="linha"
                label="Nome da linha:"
                placeholder="Nome da linha"
                value={formData.linha}
                onChange={handleChange('linha')}
                error={errors.linha}
                hideLabel
              />
              <FormField
                id="espera"
                label="Tempo de espera:"
                placeholder="Tempo de espera"
                value={formData.espera}
                onChange={handleChange('espera')}
                error={errors.espera}
                hideLabel
              />
              <FormField
                id="motivo"
                label="Motivo:"
                placeholder="Motivo"
                value={formData.motivo}
                onChange={handleChange('motivo')}
                error={errors.motivo}
                hideLabel
              />
              <FormField
                id="status"
                label="Status:"
                placeholder="Status"
                value={formData.status}
                onChange={handleChange('status')}
                error={errors.status}
                hideLabel
              />
              <div className="flex justify-center mt-2">
                <Button
                  type="submit"
                  variant="secondary"
                  disabled={sending}
                  className="w-auto px-10"
                >
                  {sending ? 'Enviando...' : 'Enviar'}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 text-texto1 font-medium hover:opacity-80 transition-opacity"
          >
            <Clock size={18} />
            <span>Histórico de notificações</span>
            {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showHistory && (
          <div className="flex justify-center mt-4">
            <div className="w-full max-w-md bg-componente1 rounded-3xl p-4">
              {recentHistory.length === 0 ? (
                 <p className="text-texto1 text-sm text-center py-4">
                   Nenhuma notificação enviada nos últimos 30 minutos
                 </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentHistory.map((item, i) => (
                    <div
                      key={i}
                      className="bg-componente3 rounded-2xl p-4 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-semibold text-texto1">
                          {item.linha}
                        </p>
                        <span className="text-xs text-texto1/70">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-texto1">
                        Motivo: {item.motivo}
                      </p>
                      <p className="text-xs text-texto1">
                        Status: {item.status}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <BottomNav />
    </div>
  )
}
