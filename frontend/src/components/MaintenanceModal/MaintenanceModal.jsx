import { useState } from 'react'
import { X } from 'lucide-react'
import FormField from '../FormField/FormField'
import Button from '../Button/Button'
import Toast from '../Toast/Toast'

const linhas = [
  'Linha 1778',
  'Linha 2341',
  'Linha 0912',
  'Linha 5567',
  'Linha 3321',
]

const setores = [
  'Setor Norte',
  'Setor Sul',
  'Setor Leste',
  'Setor Oeste',
  'Setor Central',
]

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
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50">
      <div className="bg-componente1 rounded-3xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-texto2">Cadastrar Manutenção</h2>
          <button
            onClick={onClose}
            className="text-texto2 hover:opacity-70 transition-opacity cursor-pointer"
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
              className={`w-full rounded-full bg-white/60 px-5 py-3 text-sm text-texto1 placeholder-texto1/40 transition-all duration-200 focus:ring-2 focus:ring-componente1/30 ${
                errors.linha ? 'ring-2 ring-error' : ''
              } ${!formData.linha ? 'text-texto1/40' : ''}`}
            >
              <option value="" disabled>Selecione a linha</option>
              {linhas.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            {errors.linha && <span className="text-xs text-error">{errors.linha}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <select
              id="setor"
              value={formData.setor}
              onChange={handleChange('setor')}
              className={`w-full rounded-full bg-white/60 px-5 py-3 text-sm text-texto1 placeholder-texto1/40 transition-all duration-200 focus:ring-2 focus:ring-componente1/30 ${
                errors.setor ? 'ring-2 ring-error' : ''
              } ${!formData.setor ? 'text-texto1/40' : ''}`}
            >
              <option value="" disabled>Selecione o setor</option>
              {setores.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {errors.setor && <span className="text-xs text-error">{errors.setor}</span>}
          </div>

          <div className="flex justify-center mt-2">
            <Button
              type="submit"
              variant="secondary"
              disabled={sending}
              className="w-auto px-10"
            >
              {sending ? 'Cadastrando...' : 'Cadastrar'}
            </Button>
          </div>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
