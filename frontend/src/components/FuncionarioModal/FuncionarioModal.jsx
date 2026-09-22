import { useState } from 'react'
import { X, Camera, Check } from 'lucide-react'
import FormField from '../FormField/FormField'
import Button from '../Button/Button'
import Toast from '../Toast/Toast'

const cargos = [
  'RH',
  'Maquinista',
  'Auxiliar de Maquinista',
  'Agente de Trem',
  'Manutenção',
  'Administração',
]

export default function FuncionarioModal({ funcionario, onClose, onSave, isCreate = false }) {
  const [formData, setFormData] = useState({
    nome: funcionario?.nome || '',
    email: funcionario?.email || '',
    telefone: funcionario?.telefone || '',
    cargo: funcionario?.cargo || '',
    status: funcionario?.status || 'Ativo',
    foto: funcionario?.foto || '',
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
    if (!formData.nome.trim()) newErrors.nome = 'Preencha o nome'
    if (!formData.email.trim()) newErrors.email = 'Preencha o email'
    if (!formData.telefone.trim()) newErrors.telefone = 'Preencha o telefone'
    if (!formData.cargo.trim()) newErrors.cargo = 'Selecione o cargo'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setSending(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const funcionarioData = {
        id: funcionario?.id || Date.now(),
        ...formData,
      }
      onSave(funcionarioData)
      setToast({
        message: isCreate ? 'Funcionário cadastrado!' : 'Funcionário atualizado!',
        type: 'success',
      })
      setTimeout(() => onClose(), 1500)
    } catch {
      setToast({ message: 'Erro ao salvar funcionário.', type: 'error' })
    } finally {
      setSending(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center bg-overlay"
      onClick={onClose}
    >
      <div
        className="mx-4 max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-primary p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-bold text-foreground">
            {isCreate ? 'Cadastro de Funcionário' : 'Editar Funcionário'}
          </h2>
          <button
            onClick={onClose}
            className="cursor-pointer text-foreground transition-opacity hover:opacity-70"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="mb-2 flex justify-center">
            <div className="relative">
              <div className="h-24 w-24 overflow-hidden rounded-2xl bg-secondary">
                {formData.foto ? (
                  <img
                    src={formData.foto}
                    alt="Preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.nextSibling.style.display = 'flex'
                    }}
                  />
                ) : null}
                <div
                  className={`h-full w-full items-center justify-center ${formData.foto ? 'hidden' : 'flex'}`}
                >
                  <Camera size={32} className="text-foreground/60" />
                </div>
              </div>
            </div>
          </div>

          <FormField
            id="foto"
            label="URL da foto"
            placeholder="https://exemplo.com/foto.jpg"
            value={formData.foto}
            onChange={handleChange('foto')}
            labelDark
          />

          <FormField
            id="nome"
            label="Nome"
            placeholder="Nome completo"
            value={formData.nome}
            onChange={handleChange('nome')}
            error={errors.nome}
            labelDark
          />

          <FormField
            id="email"
            label="Email"
            type="email"
            placeholder="email@exemplo.com"
            value={formData.email}
            onChange={handleChange('email')}
            error={errors.email}
            labelDark
          />

          <FormField
            id="telefone"
            label="Telefone"
            placeholder="(00) 00000-0000"
            value={formData.telefone}
            onChange={handleChange('telefone')}
            error={errors.telefone}
            labelDark
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Cargo</label>
            <select
              id="cargo"
              value={formData.cargo}
              onChange={handleChange('cargo')}
              className={`w-full rounded-full bg-secondary px-5 py-3 text-sm text-foreground transition-all duration-200 focus:ring-2 focus:ring-primary-foreground/30 ${
                errors.cargo ? 'ring-2 ring-destructive' : ''
              } ${!formData.cargo ? 'text-foreground/60' : ''}`}
            >
              <option value="" disabled>
                Selecione o cargo
              </option>
              {cargos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {errors.cargo && <span className="text-xs text-destructive">{errors.cargo}</span>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-foreground">Status</label>
            <select
              id="status"
              value={formData.status}
              onChange={handleChange('status')}
              className="w-full rounded-full bg-secondary px-5 py-3 text-sm text-foreground transition-all duration-200 focus:ring-2 focus:ring-primary-foreground/30"
            >
              <option value="Ativo">Ativo</option>
              <option value="Inativo">Inativo</option>
            </select>
          </div>

          <div className="mt-2 flex justify-center">
            <Button
              type="submit"
              variant="primary"
              disabled={sending}
              className="w-auto px-10"
              icon={<Check size={18} />}
            >
              {sending ? 'Salvando...' : isCreate ? 'Cadastrar' : 'Salvar'}
            </Button>
          </div>
        </form>
      </div>

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}
