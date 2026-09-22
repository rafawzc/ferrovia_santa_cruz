import { useState } from 'react'
import { X } from 'lucide-react'
import FormField from '../FormField/FormField'
import Button from '../Button/Button'
import Toast from '../Toast/Toast'

const tiposCarga = [
  'Minério',
  'Grãos',
  'Container',
  'Madeira',
  'Combustível',
  'Químicos',
]

const locaisPartida = [
  'Porto de Santos',
  'Porto de Paranaguá',
  'Porto de Rio Grande',
  'Porto de Vitória',
  'Porto de Aratu',
]

const destinos = [
  'São Paulo',
  'Curitiba',
  'Porto Alegre',
  'Belo Horizonte',
  'Goiânia',
  'Brasília',
]

export default function CargoModal({ onClose, onAdd, selectedTrain }) {
  const [formData, setFormData] = useState({
    tipo: '',
    peso: '',
    partida: '',
    destino: '',
    vagao: '',
  })
  const [errors, setErrors] = useState({})
  const [sending, setSending] = useState(false)
  const [toast, setToast] = useState(null)

  const vagoes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']

  const handleChange = (field) => (e) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validate = () => {
    const newErrors = {}
    if (!formData.tipo.trim()) newErrors.tipo = 'Selecione o tipo'
    if (!formData.peso.trim()) newErrors.peso = 'Preencha o peso'
    if (!formData.partida.trim()) newErrors.partida = 'Selecione o local'
    if (!formData.destino.trim()) newErrors.destino = 'Selecione o destino'
    if (!formData.vagao.trim()) newErrors.vagao = 'Selecione o vagão'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500))
      const newCargo = {
        id: Date.now(),
        ...formData,
        trem: selectedTrain,
        timestamp: Date.now(),
      }
      onAdd(newCargo)
      setFormData({ tipo: '', peso: '', partida: '', destino: '', vagao: '' })
      setToast({ message: 'Carga cadastrada com sucesso!', type: 'success' })
      setTimeout(() => onClose(), 2000)
    } catch {
      setToast({ message: 'Erro ao cadastrar carga.', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-overlay">
      <div className="bg-componente1 rounded-3xl p-6 w-full max-w-md mx-4 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-texto1">Cadastro de Carga</h2>
          <button
            onClick={onClose}
            className="text-texto1 hover:opacity-70 transition-opacity cursor-pointer"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <select
              id="tipo"
              value={formData.tipo}
              onChange={handleChange('tipo')}
              className={`w-full rounded-full bg-input-bg px-5 py-3 text-sm text-texto1 placeholder-texto1/60 transition-all duration-200 focus:ring-2 focus:ring-componente1/30 ${
                errors.tipo ? 'ring-2 ring-error' : ''
              } ${!formData.tipo ? 'text-texto1/60' : ''}`}
            >
              <option value="" disabled>Tipo de carga</option>
              {tiposCarga.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
            {errors.tipo && <span className="text-xs text-error">{errors.tipo}</span>}
          </div>

          <FormField
            id="peso"
            label="Peso:"
            placeholder="Peso (toneladas)"
            value={formData.peso}
            onChange={handleChange('peso')}
            error={errors.peso}
            hideLabel
          />

          <div className="flex flex-col gap-1.5">
            <select
              id="partida"
              value={formData.partida}
              onChange={handleChange('partida')}
              className={`w-full rounded-full bg-input-bg px-5 py-3 text-sm text-texto1 placeholder-texto1/60 transition-all duration-200 focus:ring-2 focus:ring-componente1/30 ${
                errors.partida ? 'ring-2 ring-error' : ''
              } ${!formData.partida ? 'text-texto1/60' : ''}`}
            >
              <option value="" disabled>Local de partida</option>
              {locaisPartida.map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
            {errors.partida && <span className="text-xs text-error">{errors.partida}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <select
              id="destino"
              value={formData.destino}
              onChange={handleChange('destino')}
              className={`w-full rounded-full bg-input-bg px-5 py-3 text-sm text-texto1 placeholder-texto1/60 transition-all duration-200 focus:ring-2 focus:ring-componente1/30 ${
                errors.destino ? 'ring-2 ring-error' : ''
              } ${!formData.destino ? 'text-texto1/60' : ''}`}
            >
              <option value="" disabled>Destino</option>
              {destinos.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
            {errors.destino && <span className="text-xs text-error">{errors.destino}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <select
              id="vagao"
              value={formData.vagao}
              onChange={handleChange('vagao')}
              className={`w-full rounded-full bg-input-bg px-5 py-3 text-sm text-texto1 placeholder-texto1/60 transition-all duration-200 focus:ring-2 focus:ring-componente1/30 ${
                errors.vagao ? 'ring-2 ring-error' : ''
              } ${!formData.vagao ? 'text-texto1/60' : ''}`}
            >
              <option value="" disabled>Vagão</option>
              {vagoes.map((v) => (
                <option key={v} value={v}>Vagão {v}</option>
              ))}
            </select>
            {errors.vagao && <span className="text-xs text-error">{errors.vagao}</span>}
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
