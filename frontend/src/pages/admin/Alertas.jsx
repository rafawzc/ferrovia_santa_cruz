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
    <div className="min-h-screen bg-background pb-28">
      <div className="px-6 pt-8">
        <div className="flex justify-center">
          <ScreenHeader title="Alerta e Notificações" showBack={false} />
        </div>

        <div className="mt-8 flex justify-center">
          <div className="w-full max-w-md rounded-3xl bg-primary p-6">
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
              <div className="mt-2 flex justify-center">
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

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center gap-2 font-medium text-foreground transition-opacity hover:opacity-80"
          >
            <Clock size={18} />
            <span>Histórico de notificações</span>
            {showHistory ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>

        {showHistory && (
          <div className="mt-4 flex justify-center">
            <div className="w-full max-w-md rounded-3xl bg-primary p-4">
              {recentHistory.length === 0 ? (
                <p className="py-4 text-center text-sm text-foreground">
                  Nenhuma notificação enviada nos últimos 30 minutos
                </p>
              ) : (
                <div className="flex flex-col gap-3">
                  {recentHistory.map((item, i) => (
                    <div key={i} className="flex flex-col gap-2 rounded-2xl bg-secondary p-4">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{item.linha}</p>
                        <span className="text-xs text-foreground/70">
                          {formatTime(item.timestamp)}
                        </span>
                      </div>
                      <p className="text-xs text-foreground">Motivo: {item.motivo}</p>
                      <p className="text-xs text-foreground">Status: {item.status}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <BottomNav />
    </div>
  )
}
