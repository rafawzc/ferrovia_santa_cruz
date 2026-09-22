import { useState } from 'react'
import { X } from 'lucide-react'
import FormField from '../FormField/FormField'
import Button from '../Button/Button'
import Toast from '../Toast/Toast'

const linhas = ['Linha 1778', 'Linha 2341', 'Linha 0912', 'Linha 5567', 'Linha 3321']

const setores = ['Setor Norte', 'Setor Sul', 'Setor Leste', 'Setor Oeste', 'Setor Central']

export default function MaintenanceModal({ onClose, onAdd }) {
  const [formData, setFormData] = useState({
    motivo: '',
    linha: '',
    setor: '',
  })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.motivo.trim()) newErrors.motivo = 'Preencha o motivo'
    if (!formData.linha.trim()) newErrors.linha = 'Selecione a linha'
    if (!formData.setor.trim()) newErrors.setor = 'Selecione o setor'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const newMaintenance = {
        id: Date.now(),
        ...formData,
        statusFinalizacao: 'pendente',
        timestamp: Date.now(),
      }
      onAdd(newMaintenance)
      setFormData({ motivo: '', linha: '', setor: '' })
      setToast({ message: 'Manutenção cadastrada com sucesso!', type: 'success' })
      setTimeout(() => onClose(), 2000)
    } catch {
      setToast({ message: 'Erro ao cadastrar manutenção.', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-overlay">
      <div className="mx-4 w-full max-w-md rounded-3xl bg-primary p-6 shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">Cadastrar Manutenção</h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-foreground transition-opacity hover:opacity-70"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FormField
            id="motivo"
            label="Motivo:"
            placeholder="Motivo"
            value={formData.motivo}
            onChange={handleChange('motivo')}
            error={errors.motivo}
            hideLabel
          />

          <div className="flex flex-col gap-1.5">
            <select
              id="linha"
              value={formData.linha}
              onChange={handleChange('linha')}
              className={`w-full rounded-full bg-input px-5 py-3 text-sm text-foreground placeholder-foreground/60 transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
                errors.linha ? 'ring-2 ring-destructive' : ''
              } ${!formData.linha ? 'text-foreground/60' : ''}`}
            >
              <option value="" disabled>
                Selecione a linha
              </option>
              {linhas.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
            {errors.linha && <span className="text-xs text-destructive">{errors.linha}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <select
              id="setor"
              value={formData.setor}
              onChange={handleChange('setor')}
              className={`w-full rounded-full bg-input px-5 py-3 text-sm text-foreground placeholder-foreground/60 transition-all duration-200 focus:ring-2 focus:ring-primary/30 ${
                errors.setor ? 'ring-2 ring-destructive' : ''
              } ${!formData.setor ? 'text-foreground/60' : ''}`}
            >
              <option value="" disabled>
                Selecione o setor
              </option>
              {setores.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            {errors.setor && <span className="text-xs text-destructive">{errors.setor}</span>}
          </div>

          <div className="mt-2 flex justify-center">
            <Button type="submit" variant="secondary" disabled={sending} className="w-auto px-10">
              {sending ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
